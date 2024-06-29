import { deployMGearBattleForEquipTests } from "./util";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, BigNumber } from "ethers";
import { itemsByStrength } from "./items";
import { getStats, getRarityIndex } from "./mgear";
import { join } from "path";

type StatNames = "ruin" | "guard" | "vigor" | "celerity";

const statTypeToName: StatNames[] = ["ruin", "guard", "vigor", "celerity"];

const equipItems =
  (battle: Contract) =>
  async (player1: number[] = [1, 2, 3, 4]) => {
    await battle.equipItems(player1[0], player1[1], player1[2], player1[3]);
  };

describe("Contract statistics", function () {
  it("runs some stats", async function () {
    const { mfiends } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();
    const runs = 1000;
    const equips = [
      [1, 0, 0, 0],
      [1, 2, 0, 0],
      [1, 2, 3, 0],
      [1, 2, 3, 4],

      [5, 2, 3, 4],
      [5, 6, 3, 4],
      [5, 6, 7, 4],
      [5, 6, 7, 8],

      [9, 6, 7, 8],
      [9, 10, 7, 8],
      [9, 10, 11, 8],
      [9, 10, 11, 12],

      [13, 10, 11, 12],
      [13, 14, 11, 12],
      [13, 14, 15, 12],
      [13, 14, 15, 16],

      [17, 14, 15, 16],
      [17, 18, 15, 16],
      [17, 18, 19, 16],
      [17, 18, 19, 20],
    ];
    const statistics = { wins: 0, losses: 0 };
    for (let i = 0; i < equips.length; i += 1) {
      console.log(`----- ROUND ${i} ------`);
      await equipItems(mfiends)(equips[i]);
      const stats = await mfiends.stats(owner.address);

      console.log(
        `RUIN: ${stats.ruin.toNumber()} GUARD: ${stats.guard.toNumber()} VIGOR: ${stats.vigor.toNumber()} CELERTIY: ${stats.celerity.toNumber()}`
      );
      for (let j = 0; j < runs; j += 1) {
        const nonce = i * runs + j;
        try {
          await mfiends.mint(nonce, false);
          statistics.wins = statistics.wins + 1;
        } catch (e) {
          statistics.losses = statistics.losses + 1;
        }
      }
      console.log("EQUIPS: ", equips[i]);
      console.log("RESULT: WINS", statistics.wins, " LOSSES: ", statistics.losses);
      statistics.wins = 0;
      statistics.losses = 0;
    }
  });
});
