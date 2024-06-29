import { deployMFiends, getStatsFromItems } from "./util";
import { items, randomMgear, itemsMeta } from "./items";
import { ethers } from "hardhat";
import { hash } from "./word-util";
import { BigNumber } from "@ethersproject/bignumber";
import { executeGame, Player } from "./game-sim-app";
import { expect } from "chai";
import { randomBytes } from "ethers/lib/utils";

const gameResultToMessage = ["Challenger wins!", "Challenger loses!", "Tie!"];

const randomStat = () => randomMgear().and("0xF").toNumber() + 4;

const playerArrayToStats = (arr: BigNumber[]): Player => ({
  ruin: arr[0].toNumber(),
  guard: arr[1].toNumber(),
  vigor: arr[2].toNumber(),
  celerity: arr[3].toNumber(),
});

describe("Game sim", function () {
  it("game sim should equal contract", async function () {
    const battle = await deployMFiends();

    for (let i = 0; i < 10000; i += 1) {
      const player1 = {
        ruin: randomStat(),
        guard: randomStat(),
        vigor: randomStat(),
        celerity: randomStat(),
      };
      const player2 = {
        ruin: randomStat(),
        guard: randomStat(),
        vigor: randomStat(),
        celerity: randomStat(),
      };
      console.log("!!!!!!!Running!!!!!!! ", i);
      console.log("-------");
      const game = randomMgear();
      const simResult = executeGame(game, player1, player2);
      console.log("-------");
      const contractResult = await battle.executeGame(game, player1, player2);
      console.log("-------");
      console.log({ simResult, contractResult });
      console.log(JSON.stringify(simResult.turns.map((turn) => turn.damage)));
      if (contractResult !== simResult.result) {
        console.log(
          "DISCREPANCY: ",
          JSON.stringify(simResult.turns),
          JSON.stringify({ challenger: player1 }),
          JSON.stringify({ enemy: player2 })
        );
      }
      expect(contractResult).to.equal(simResult.result);
    }
  });

  it("identical stats should have equal outcomes", async function () {
    const player1 = { vigor: 15, ruin: 8, celerity: 10, guard: 10 };
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const result = executeGame(randomMgear(), player1, player1);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("same", { wins, losses });
  });

  // { wins: 394, losses: 343, ties: 263 }
  // { wins: 350, losses: 374, ties: 276 }
  // { wins: 365, losses: 353, ties: 282 }
  // { wins: 3610, losses: 3586, ties: 2804 }

  it("player with better stats should have better outcomes - +1 in each stat", async function () {
    const player1 = { vigor: 15, ruin: 8, celerity: 10, guard: 10 };
    const player2 = { vigor: 16, ruin: 9, celerity: 11, guard: 11 };
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("+1 in each stat", { wins, losses });
  });

  it("player with better stats should have better outcomes - +2 in each stat", async function () {
    const player1 = { vigor: 15, ruin: 8, celerity: 10, guard: 10 };
    const player2 = { vigor: 17, ruin: 10, celerity: 12, guard: 12 };
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("+2 in each stat", { wins, losses });
  });

  const createPlayerWithStatTotal = (statTotal: number, varianceInput: number) => {
    const base = Math.floor(statTotal / 4);
    const variance = varianceInput > base ? base : varianceInput;
    const adjustment1 = Math.floor(Math.random() * variance);
    const adjustment2 = Math.floor(Math.random() * variance);

    const stats = [base, base, base, base];

    const randomPair1 = Math.floor(Math.random() * 4);
    let randomPair2 = randomPair1;

    while (randomPair2 === randomPair1) {
      randomPair2 = Math.floor(Math.random() * 4);
    }

    stats[randomPair1] = base + adjustment1;
    stats[randomPair2] = base - adjustment1;

    const otherPair = [0, 1, 2, 3].filter((n) => n !== randomPair1 || n !== randomPair2);

    const first = Math.floor(Math.random() * 2);
    const second = first ? 0 : 1;

    stats[otherPair[first]] = base - adjustment2;
    stats[otherPair[second]] = base + adjustment2;

    return { ruin: stats[0], guard: stats[1], vigor: stats[2], celerity: stats[3] };
  };

  it("player with same stats but different distribution should have similar outcomes", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(36, 4);
      const player2 = createPlayerWithStatTotal(36, 4);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("different distribution", { wins, losses });
  });

  it("player with same stats but different distribution should have similar outcomes", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(80, 10);
      const player2 = createPlayerWithStatTotal(80, 10);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("different distribution - higher", { wins, losses });
  });

  it("ruin is a good stat", async function () {
    const player1 = { vigor: 10, ruin: 10, celerity: 10, guard: 10 };
    const player2 = { vigor: 10, ruin: 14, celerity: 10, guard: 10 };
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("ruin is a good stat", { wins, losses });
  });

  it("guard is a good stat", async function () {
    const player1 = { vigor: 10, ruin: 10, celerity: 10, guard: 10 };
    const player2 = { vigor: 10, ruin: 10, celerity: 10, guard: 14 };
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("guard is a good stat", { wins, losses });
  });

  const maxRuin = { celerity: 9, guard: 9, ruin: 45, vigor: 9 };
  const maxGuard = { celerity: 9, guard: 45, ruin: 9, vigor: 9 };
  const maxVigor = { celerity: 9, guard: 9, ruin: 9, vigor: 45 };
  const maxCelerity = { celerity: 45, guard: 9, ruin: 9, vigor: 9 };

  const evenMax = { celerity: 21, guard: 21, ruin: 21, vigor: 21 };

  it("celerity is a good stat", async function () {
    const player1 = { vigor: 10, ruin: 10, celerity: 10, guard: 10 };
    const player2 = { vigor: 10, ruin: 10, celerity: 14, guard: 10 };
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("celerity is a good stat", { wins, losses });
  });

  it("vigor is a good stat", async function () {
    const player1 = { vigor: 20, ruin: 10, celerity: 10, guard: 10 };
    const player2 = { vigor: 24, ruin: 10, celerity: 10, guard: 10 };
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("vigor is a good stat", { wins, losses });
  });

  it("max vs. max", async function () {
    const results: { [k: string]: any } = {};
    const maxes = [maxRuin, maxGuard, maxVigor, maxCelerity];
    const maxNames = ["ruin", "guard", "vigor", "celerity"];

    for (let m = 0; m < maxes.length; m += 1) {
      for (let m2 = 0; m2 < maxes.length; m2 += 1) {
        const challenger = maxes[m];
        const challengee = maxes[m2];
        const name = `${maxNames[m]} vs ${maxNames[m2]}`;
        const subResults = [];
        console.log("running ", name);
        for (let i = 0; i < 1000; i += 1) {
          const result = executeGame(randomMgear(), challenger, challengee);
          subResults.push(result);
        }

        const wins = subResults.filter((r) => r.result).length;
        const losses = subResults.filter((r) => !r.result).length;

        results[name] = { wins, losses };
      }
    }
    console.log(results);
  });

  it("random - 2 stat total difference", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(32, 4);
      const player2 = createPlayerWithStatTotal(34, 4);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("random - 2 stat total difference", { wins, losses });
  });

  it("random - 4 stat total difference", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(32, 4);
      const player2 = createPlayerWithStatTotal(36, 4);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("random - 4 stat total difference", { wins, losses });
  });

  it("random - 4 stat total difference starting high", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(60, 6);
      const player2 = createPlayerWithStatTotal(64, 6);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("random - 4 stat total difference starting high", { wins, losses });
  });

  it("random - 8 stat total difference", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(32, 6);
      const player2 = createPlayerWithStatTotal(40, 6);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("random - 8 stat total difference", { wins, losses });
  });

  it("random - 12 stat total difference", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(32, 5);
      const player2 = createPlayerWithStatTotal(44, 5);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("random - 12 stat total difference", { wins, losses });
  });

  it("random - 12 stat total difference starting higher", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(60, 8);
      const player2 = createPlayerWithStatTotal(72, 8);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("random - 12 stat total difference starting higher", { wins, losses });
  });

  it("random - 16 stat total difference starting higher", async function () {
    const results = [];
    for (let i = 0; i < 1000; i += 1) {
      const player1 = createPlayerWithStatTotal(60, 8);
      const player2 = createPlayerWithStatTotal(76, 8);
      // console.log({ player1, player2 });
      const result = executeGame(randomMgear(), player1, player2);
      results.push(result);
    }
    const wins = results.filter((r) => r.result).length;
    const losses = results.filter((r) => !r.result).length;
    console.log("random - 16 stat total difference starting higher", { wins, losses });
  });

  it("calculate win probability", async function () {
    const percents: any[] = [];
    const normalizedPercents: { [key: string]: any } = {};

    const bases = [20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84];
    const strengths = [2, 4, 6, 8, 10, 12, 16, 20];
    const variances = [4, 8, 12];

    bases.forEach((base) => {
      strengths.forEach((strength) => {
        console.log("measuring ", { base, strength });
        const results: boolean[] = [];
        const weaker = base;
        const stronger = base + strength;
        const percentStronger = stronger / weaker;
        const percentNormalized = Math.floor(percentStronger * 100);

        variances.forEach((variance) => {
          console.log(variance);
          for (let i = 0; i < 500; i += 1) {
            const player1 = createPlayerWithStatTotal(weaker, variance);
            const player2 = createPlayerWithStatTotal(stronger, variance);
            // console.log({ player1, player2 });
            const { result } = executeGame(randomMgear(), player2, player1);
            results.push(result);
          }
        });

        const wins = results.filter((r) => r).length;
        const losses = results.filter((r) => !r).length;

        percents.push({
          percentStronger,
          winProbability: wins / (wins + losses),
          lossProbability: losses / (wins + losses),
        });

        if (normalizedPercents[percentNormalized]) {
          normalizedPercents[percentNormalized] = [
            ...normalizedPercents[percentNormalized],
            {
              winProbability: wins / (wins + losses),
              lossProbability: losses / (wins + losses),
            },
          ];
        } else {
          normalizedPercents[percentNormalized] = [
            {
              winProbability: wins / (wins + losses),
              lossProbability: losses / (wins + losses),
            },
          ];
        }
      });
    });
    const normalizedResult: any = {};
    Object.keys(normalizedPercents).forEach((percent) => {
      const rs = normalizedPercents[percent];
      const win = rs.reduce((acc: any, curr: any) => acc + curr.winProbability, 0) / rs.length;

      const loss = rs.reduce((acc: any, curr: any) => acc + curr.lossProbability, 0) / rs.length;
      const wagerRatio = win / loss;

      normalizedResult[percent] = { win, loss, wagerRatio };
    });
    console.log(JSON.stringify(normalizedResult));
  });
});

// 5% 1:1
// 10% 5:4
// 15% 7:5
// 20% 8:5
// 25% 9:5
// 30% 2:1
// 35% 5:2
// 40% 3:1
// 45% 7:2
// 50% 4:1
// 55% 11:2
// 60% 5:1;
// 80% 8:1
// 100% 10:1
