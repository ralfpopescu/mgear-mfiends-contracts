import { deployMGearBattle, deployMFiends } from "./util";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Contract } from "ethers";

// const oneEth = BigNumber.from("1000000000000000000");
const entryFee = BigNumber.from("5000000");
const regFee = BigNumber.from("10000000");

const equipItems =
  (battle: Contract) =>
  async (player1: number[] = [1, 2, 3, 4]) => {
    await battle.equipItems(player1[0], player1[1], player1[2], player1[3]);
  };

const getResult = async (battle: Contract) => {
  await battle.challenge({ value: entryFee });
  await advanceBlocks(battle);
  await battle.executeChallenge();
  const [owner] = await ethers.getSigners();
  const results = await battle.queryFilter(battle.filters.Result(owner.address));
  const resultArgs = results.map((result) => result.args);
  const result = resultArgs[resultArgs.length - 1];
  return result;
};

const advanceBlocks = async (battle: Contract) => {
  await Promise.all([
    battle.donate({ value: entryFee }),
    battle.donate({ value: entryFee }),
    battle.donate({ value: entryFee }),
    battle.donate({ value: entryFee }),
    battle.donate({ value: entryFee }),
  ]);
};

const seed = "0x800ee1e3b52439a72f224caac5c7dd2b7a87e1424706994130eae1a41f920be0";

const adjustSeed = (roll: number) => {
  const result = BigNumber.from(seed)
    .and("0x0effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    .add(BigNumber.from(roll).shl(251));

  console.log(result._hex);
  return result;
};

const rolls = [
  { type: "ABYSSAL", roll: 0 },
  { type: "UMBRAL", roll: 1 },
  { type: "LUMINOUS", roll: 3 },
  { type: "PLASMIC", roll: 8 },
  { type: "FLUID", roll: 12 },
  { type: "ORGANIC", roll: 16 },
  { type: "VIBRANT", roll: 24 },
  { type: "PROTOTYPICAL", roll: 30 },
];

describe("Fiend rendering", function () {
  it("renders", async function () {
    const mfiends = await deployMFiends();
    try {
      for (let i = 0; i < rolls.length; i += 1) {
        const { type, roll } = rolls[i];
        console.log("RENDERING: ", type, roll);
        const adjustedSeed = adjustSeed(roll);
        const palette = await mfiends.getPalette(adjustedSeed);
        console.log(palette._hex);
        const rendered = await mfiends.renderData("0x2bB538E5", [palette]);
        console.log(rendered);
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  });

  it("gets equipped items", async function () {
    const mfiends = await deployMFiends();
    try {
      const [owner] = await ethers.getSigners();

      const ruinItem = await mfiends.equipped(0, owner.address);
      const blockItem = await mfiends.equipped(1, owner.address);
      const vigorItem = await mfiends.equipped(2, owner.address);
      const celerityItem = await mfiends.equipped(3, owner.address);

      console.log({ ruinItem, blockItem, vigorItem, celerityItem });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });
});

xdescribe("Battle system", function () {
  it("equip items", async function () {
    const battle = await deployMGearBattle();
    const [owner] = await ethers.getSigners();
    await battle.register({ value: regFee });
    await equipItems(battle)();

    const ruin1 = await battle.stats(owner.address, 0);
    const guard1 = await battle.stats(owner.address, 1);
    const vigor1 = await battle.stats(owner.address, 2);
    const celerity1 = await battle.stats(owner.address, 3);

    expect(ruin1).to.equal(22);
    expect(guard1).to.equal(27);
    expect(vigor1).to.equal(25);
    expect(celerity1).to.equal(21);
  });

  it("equip same items, stats should be the same", async function () {
    const battle = await deployMGearBattle();
    const [owner] = await ethers.getSigners();
    await battle.register({ value: regFee });
    await equipItems(battle)();

    const ruin1 = await battle.stats(owner.address, 0);
    const guard1 = await battle.stats(owner.address, 1);
    const vigor1 = await battle.stats(owner.address, 2);
    const celerity1 = await battle.stats(owner.address, 3);

    expect(ruin1).to.equal(22);
    expect(guard1).to.equal(27);
    expect(vigor1).to.equal(25);
    expect(celerity1).to.equal(21);
  });

  it("happy path", async function () {
    const battle = await deployMGearBattle();
    await battle.register({ value: regFee });
    await equipItems(battle)();
    await battle.challenge({ value: entryFee });
    await advanceBlocks(battle);
    const result = await battle.executeChallenge();
    console.log({ result });
  });

  it("should be some wins", async function () {
    return;
    const battle = await deployMGearBattle();
    await battle.register({ value: regFee });
    await equipItems(battle)();
    const results = [0, 0];

    for (let i = 0; i <= 100; i += 1) {
      console.log("Running result: ", i);
      const result = await getResult(battle);
      if (result?.win) {
        results[1] = results[1] + 1;
      } else {
        results[0] = results[0] + 1;
      }
    }
    expect(results[1]).to.be.greaterThan(35);
  });

  it("should be fewer wins", async function () {
    return;
    const battle = await deployMGearBattle();
    await battle.register({ value: regFee });
    await equipItems(battle)([0, 2, 3, 0]);

    const [owner] = await ethers.getSigners();

    const ruin1 = await battle.stats(owner.address, 0);
    const guard1 = await battle.stats(owner.address, 1);
    const vigor1 = await battle.stats(owner.address, 2);
    const celerity1 = await battle.stats(owner.address, 3);

    expect(ruin1).to.equal(7);
    expect(guard1).to.equal(15);
    expect(vigor1).to.equal(16);
    expect(celerity1).to.equal(15);

    const results = [0, 0];

    for (let i = 0; i <= 100; i += 1) {
      console.log("Running result: ", i);
      const result = await getResult(battle);
      if (result?.win) {
        results[1] = results[1] + 1;
      } else {
        results[0] = results[0] + 1;
      }
    }
    console.log(results);
  });

  it("should be even fewer wins", async function () {
    const battle = await deployMGearBattle();
    await battle.register({ value: regFee });
    await equipItems(battle)([0, 0, 3, 0]);

    const results = [0, 0];

    for (let i = 0; i <= 100; i += 1) {
      console.log("Running result: ", i);
      const result = await getResult(battle);
      if (result?.win) {
        results[1] = results[1] + 1;
      } else {
        results[0] = results[0] + 1;
      }
    }

    expect(results[0]).to.be.greaterThan(75);
    expect(results[1]).to.be.lessThan(25);
  });
});
