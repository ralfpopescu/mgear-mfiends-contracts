import { BigNumber } from "ethers";

export type Player = { celerity: number; vigor: number; ruin: number; guard: number };

const ROLL_MASK = BigNumber.from("0x7f");
const ATTACK_MASK = BigNumber.from("0x3");

const TURN_SHIFT = 25;

const BASE_ROLL = 16;
const CRIT_SHIFT = 7;
const MISS_SHIFT = 14;
const BLOCK_SHIFT = 21;
const ATTACK_SHIFT = 23;

const doLog = false;

const log = (payload: any, force?: boolean) => {
  if (doLog || force) console.log(payload);
};

const subtractWithLimit = (n1: BigNumber, n2: BigNumber) => {
  if (n2.gt(n1)) return BigNumber.from(0);
  else return n1.sub(n2);
};

export type Turn = {
  miss: boolean;
  slip: boolean;
  dodge: boolean;
  crit: boolean;
  block: 0 | 1 | 2 | 3;
  blockAmount: number;
  damage: number;
};

// 21 bits is a turn
const getDamageFromTurn = (
  game: BigNumber,
  turn: number,
  damageTaker: Player,
  damageDealer: Player
): Turn => {
  const turnMeta: Turn = {
    miss: false,
    slip: false,
    dodge: false,
    crit: false,
    block: 3,
    blockAmount: 0,
    damage: 0,
  };

  const turnShift = TURN_SHIFT * turn;
  let damageTakerDodgeRoll = game.shr(turnShift).and(ROLL_MASK);

  damageTakerDodgeRoll = subtractWithLimit(
    damageTakerDodgeRoll,
    BigNumber.from(damageTaker.celerity * 2)
  );

  const missRollUnadjusted = game.shr(turnShift + MISS_SHIFT).and(ROLL_MASK);
  const missRoll = missRollUnadjusted.add(damageDealer.celerity * 2);

  if (damageTakerDodgeRoll.toNumber() < BASE_ROLL || missRoll.toNumber() < BASE_ROLL) {
    if (damageTakerDodgeRoll.toNumber() < BASE_ROLL) turnMeta.dodge = true;
    if (missRoll.toNumber() < BASE_ROLL) turnMeta.miss = true;
    turnMeta.damage = 0;
    return turnMeta;
  }

  let critRoll = game.shr(turnShift + CRIT_SHIFT).and(ROLL_MASK);
  if (damageTaker.celerity * 3 > critRoll.toNumber()) {
    critRoll = BigNumber.from(0);
  } else {
    critRoll = subtractWithLimit(critRoll, BigNumber.from(damageTaker.celerity * 3));
  }

  if (damageDealer.ruin > damageTaker.ruin) {
    critRoll = critRoll.add((damageDealer.ruin - damageTaker.ruin) * 5);
  }

  const blockRoll = game.shr(turnShift + BLOCK_SHIFT).and(ATTACK_MASK);

  console.log("SIM BLOCK ROLL", turn, blockRoll);

  const blockAmount = BigNumber.from(damageTaker.guard).shr(blockRoll.toNumber()).toNumber();
  turnMeta.blockAmount = blockAmount;

  const attackAdjustment = game
    .shr(turnShift + ATTACK_SHIFT)
    .and(ATTACK_MASK)
    .toNumber();

  let damage =
    subtractWithLimit(BigNumber.from(damageDealer.ruin), BigNumber.from(2)).toNumber() +
    attackAdjustment;

  if (missRoll.toNumber() < BASE_ROLL * 2) {
    turnMeta.slip = true;
    damage = Math.floor(damage / 2);
  }

  if (critRoll.toNumber() < BASE_ROLL) {
    log({ message: "crit!", roll: critRoll.toNumber() });
    turnMeta.crit = true;
    damage = damage + damage;
  }

  // minimum of 1 damage if defense exceeds
  if (blockAmount > damage) {
    damage = 1;
  } else {
    damage = damage - blockAmount;
  }

  turnMeta.damage = damage;
  return turnMeta;
};

const getTieBreak = (game: BigNumber, challenger: Player) => {
  console.log("SIM TIE BREAK!");
  return (
    game.shr(250).and(0x3f).toNumber() +
      (challenger.ruin + challenger.guard + challenger.vigor + challenger.celerity - 11) >
    64
  );
};
type GameExecution = {
  result: boolean;
  turns: Turn[];
};

// game returns winning address, or 0 if tie
export const executeGame = (game: BigNumber, challenger: Player, enemy: Player): GameExecution => {
  let enemyHealth = enemy.vigor;
  let challengerHealth = challenger.vigor;

  const gameTurns = [];

  for (let turn = 0; turn < 5; turn++) {
    log({ turn, enemyHealth, challengerHealth });
    // defender attacks first
    const playerTurn = getDamageFromTurn(game, turn * 2, enemy, challenger);
    const playerDamage = playerTurn.damage;

    // opposer attacks next
    const enemyTurn = getDamageFromTurn(game, turn * 2 + 1, challenger, enemy);

    const enemyDamage = enemyTurn.damage;

    if (enemyDamage >= challengerHealth && playerDamage >= enemyHealth) {
      gameTurns.push(playerTurn);
      gameTurns.push(enemyTurn);
      return { result: getTieBreak(game, challenger), turns: gameTurns };
    }

    gameTurns.push(playerTurn);

    if (playerDamage >= enemyHealth) {
      console.log("SIM PLAYER WINS", playerDamage, enemyHealth);
      return { result: true, turns: gameTurns };
    }

    //only push turn if win condition hasn't been met

    gameTurns.push(enemyTurn);

    if (enemyDamage >= challengerHealth) {
      console.log("SIM ENEMY WINS", enemyDamage, challengerHealth);
      return { result: false, turns: gameTurns };
    }

    //proceed with damage if no win conditions are met
    challengerHealth = challengerHealth - enemyDamage;
    enemyHealth = enemyHealth - playerDamage;
  }
  //if 5 turns go bye, it's a tie
  return { result: getTieBreak(game, challenger), turns: gameTurns };
};
