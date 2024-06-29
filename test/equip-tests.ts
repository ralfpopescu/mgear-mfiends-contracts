import { deployMGearBattleForEquipTests } from "./util";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, BigNumber } from "ethers";
import { itemsByStrength } from "./items";
import { getStats, getRarityIndex } from "./mgear";

type StatNames = "ruin" | "guard" | "vigor" | "celerity";

const statTypeToName: StatNames[] = ["ruin", "guard", "vigor", "celerity"];

const equipItems =
  (battle: Contract) =>
  async (player1: number[] = [1, 2, 3, 4]) => {
    await battle.equipItems(player1[0], player1[1], player1[2], player1[3]);
  };

describe("Equip", function () {
  it("equip items", async function () {
    const { mfiends } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();
    await equipItems(mfiends)();

    const stats = await mfiends.stats(owner.address);
    const { ruin, guard, vigor, celerity } = stats;

    expect(ruin).to.equal(5);
    expect(guard).to.equal(4);
    expect(vigor).to.equal(14);
    expect(celerity).to.equal(4);
  });

  const getStatsFromMgear = (mgearData: BigNumber) => {
    const stats = { ruin: 0, guard: 0, vigor: 0, celerity: 0 };
    const computedStats = getStats(mgearData, getRarityIndex(mgearData));
    return { ...stats, ...computedStats };
  };

  const getStatGetter = (mgear: Contract, mfiends: Contract) => async (itemId: number) => {
    const stats = { ruin: 0, guard: 0, vigor: 0, celerity: 0 };
    const mgearData = await mgear.tokenIdToMGear(itemId);

    const majorStatType = await mfiends.getMajorType(mgearData);
    const majorStatValue = await mfiends.getMajorValue(mgearData);
    stats[statTypeToName[majorStatType]] = stats[statTypeToName[majorStatType]] + majorStatValue;

    const minor1StatType = await mfiends.getMinorType1(mgearData);
    const minor1StatValue = await mfiends.getMinorValue1(mgearData);
    if (statTypeToName[minor1StatType])
      stats[statTypeToName[minor1StatType]] =
        stats[statTypeToName[minor1StatType]] + minor1StatValue;

    const minor2StatType = await mfiends.getMinorType2(mgearData);
    const minor2StatValue = await mfiends.getMinorValue2(mgearData);
    if (statTypeToName[minor2StatType])
      stats[statTypeToName[minor2StatType]] =
        stats[statTypeToName[minor2StatType]] + minor2StatValue;

    return stats;
  };

  const getExpectedStatTotal = async (items: number[], mgear: Contract, mfiends: Contract) => {
    const statGetter = getStatGetter(mgear, mfiends);

    const item1Stats = await statGetter(items[0]);
    const item2Stats = await statGetter(items[1]);
    const item3Stats = await statGetter(items[2]);
    const item4Stats = await statGetter(items[3]);

    // starting stats
    const stats = { ruin: 1, guard: 0, vigor: 10, celerity: 0 };

    stats.ruin = stats.ruin + item1Stats.ruin + item2Stats.ruin + item3Stats.ruin + item4Stats.ruin;
    stats.guard = item1Stats.guard + item2Stats.guard + item3Stats.guard + item4Stats.guard;
    stats.vigor =
      stats.vigor + item1Stats.vigor + item2Stats.vigor + item3Stats.vigor + item4Stats.vigor;
    stats.celerity =
      item1Stats.celerity + item2Stats.celerity + item3Stats.celerity + item4Stats.celerity;

    return stats;
  };

  it("updates items", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();

    await equipItems(mfiends)([1, 2, 3, 4]);
    let expectedStats = await getExpectedStatTotal([1, 2, 3, 4], dummyMGear, mfiends);
    let stats = await mfiends.stats(owner.address);

    console.log({ stats, expectedStats });

    expect(stats.ruin).to.equal(expectedStats.ruin);
    expect(stats.guard).to.equal(expectedStats.guard);
    expect(stats.vigor).to.equal(expectedStats.vigor);
    expect(stats.celerity).to.equal(expectedStats.celerity);

    await equipItems(mfiends)([5, 6, 7, 8]);

    expectedStats = await getExpectedStatTotal([5, 6, 7, 8], dummyMGear, mfiends);
    stats = await mfiends.stats(owner.address);

    console.log({ stats, expectedStats });

    expect(stats.ruin).to.equal(expectedStats.ruin);
    expect(stats.guard).to.equal(expectedStats.guard);
    expect(stats.vigor).to.equal(expectedStats.vigor);
    expect(stats.celerity).to.equal(expectedStats.celerity);
  });

  it("partial items update", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();

    await equipItems(mfiends)([1, 2, 3, 4]);
    let expectedStats = await getExpectedStatTotal([1, 2, 3, 4], dummyMGear, mfiends);
    let stats = await mfiends.stats(owner.address);

    console.log({ stats, expectedStats });

    expect(stats.ruin).to.equal(expectedStats.ruin);
    expect(stats.guard).to.equal(expectedStats.guard);
    expect(stats.vigor).to.equal(expectedStats.vigor);
    expect(stats.celerity).to.equal(expectedStats.celerity);

    await equipItems(mfiends)([0, 0, 7, 0]);

    expectedStats = await getExpectedStatTotal([1, 2, 7, 4], dummyMGear, mfiends);
    stats = await mfiends.stats(owner.address);

    console.log({ stats, expectedStats });

    expect(stats.ruin).to.equal(expectedStats.ruin);
    expect(stats.guard).to.equal(expectedStats.guard);
    expect(stats.vigor).to.equal(expectedStats.vigor);
    expect(stats.celerity).to.equal(expectedStats.celerity);
  });

  it("initial items", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();

    await equipItems(mfiends)([1, 2, 0, 0]);
    let expectedStats = await getExpectedStatTotal([1, 2, 0, 0], dummyMGear, mfiends);
    let stats = await mfiends.stats(owner.address);

    console.log({ stats, expectedStats });

    expect(stats.ruin).to.equal(expectedStats.ruin);
    expect(stats.guard).to.equal(expectedStats.guard);
    expect(stats.vigor).to.equal(expectedStats.vigor);
    expect(stats.celerity).to.equal(expectedStats.celerity);

    await equipItems(mfiends)([1, 2, 7, 0]);

    expectedStats = await getExpectedStatTotal([1, 2, 7, 0], dummyMGear, mfiends);
    stats = await mfiends.stats(owner.address);

    console.log({ stats, expectedStats });

    expect(stats.ruin).to.equal(expectedStats.ruin);
    expect(stats.guard).to.equal(expectedStats.guard);
    expect(stats.vigor).to.equal(expectedStats.vigor);
    expect(stats.celerity).to.equal(expectedStats.celerity);
  });

  enum RarityIndex {
    FLIMSY,
    SOLID,
    NOTEWORTHY,
    EXTRAORDINARY,
    FABLED,
    UNREAL,
  }

  const statIndexToStatName = ["ruin", "guard", "vigor", "celerity"];

  const TIER2_BOOST = 3;
  const TIER3_BOOST = 6;

  const getStatTypes = (mgear: BigNumber) => {
    const statMask = BigNumber.from("0x3");
    const major = mgear.shr(19).and(statMask).toNumber();
    const minor1 = mgear.shr(21).and(statMask).toNumber();
    const minor2 = mgear.shr(23).and(statMask).toNumber();

    return {
      major,
      minor1,
      minor2,
    };
  };

  const getStatValues = (mgear: BigNumber) => {
    const statMask = BigNumber.from("0x3");
    const major = mgear.shr(25).and(statMask).toNumber();
    const minor1 = mgear.shr(27).and(statMask).toNumber();
    const minor2 = mgear.shr(29).and(statMask).toNumber();

    return {
      major,
      minor1,
      minor2,
    };
  };

  const getStats = (mgear: BigNumber, rarityIndex?: number) => {
    const rarity = rarityIndex !== undefined ? rarityIndex : getRarityIndex(mgear);

    if (rarity > 5 || rarity < 0) throw new Error("Invalid rarity index");

    const statTypes = getStatTypes(mgear);
    const statValues = getStatValues(mgear);

    if (rarity === RarityIndex.FLIMSY) {
      return { [statIndexToStatName[statTypes.major]]: statValues.major };
    }
    if (rarity === RarityIndex.SOLID) {
      return { [statIndexToStatName[statTypes.major]]: statValues.major + TIER2_BOOST };
    }
    if (rarity === RarityIndex.NOTEWORTHY) {
      return {
        [statIndexToStatName[statTypes.major]]: statValues.major + TIER2_BOOST,
        [statIndexToStatName[statTypes.minor1]]: statValues.minor1,
      };
    }
    if (rarity === RarityIndex.EXTRAORDINARY) {
      return {
        [statIndexToStatName[statTypes.major]]: statValues.major + TIER2_BOOST,
        [statIndexToStatName[statTypes.minor1]]: statValues.minor1 + TIER2_BOOST,
      };
    }
    if (rarity === RarityIndex.FABLED) {
      return {
        [statIndexToStatName[statTypes.major]]: statValues.major + TIER3_BOOST,
        [statIndexToStatName[statTypes.minor1]]: statValues.minor1 + TIER2_BOOST,
        [statIndexToStatName[statTypes.minor2]]: statValues.minor1,
      };
    }
    if (rarity === RarityIndex.UNREAL) {
      return {
        [statIndexToStatName[statTypes.major]]: statValues.major + TIER3_BOOST,
        [statIndexToStatName[statTypes.minor1]]: statValues.minor1 + TIER2_BOOST,
        [statIndexToStatName[statTypes.minor2]]: statValues.minor1 + TIER2_BOOST,
      };
    }
    return {};
  };

  const getExpectedStats = (index: number) => {
    const stats = { ruin: 1, guard: 0, vigor: 10, celerity: 0 };
    const rarityIndex = Math.floor(index / 4) + 1;
    const item = itemsByStrength[index];
    const itemStats = getStats(item, rarityIndex);

    stats.ruin = stats.ruin + (itemStats.ruin || 0);
    stats.guard = stats.guard + (itemStats.guard || 0);
    stats.vigor = stats.vigor + (itemStats.vigor || 0);
    stats.celerity = stats.celerity + (itemStats.celerity || 0);

    console.log({ itemStats, stats, rarityIndex });

    return stats;
  };

  it("each item creates expected diff", async function () {
    const { mfiends } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();

    for (let i = 0; i <= 19; i += 1) {
      console.log("EVALUATING ", i);
      const itemType = i % 4;
      const equipArray = [0, 0, 0, 0];
      equipArray[itemType] = i + 1;
      const statsBefore = await mfiends.stats(owner.address);
      console.log({ statsBefore, equipArray });
      await equipItems(mfiends)(equipArray);

      // ids are 1 indexed, items are a 0-indexed array
      const expectedStats = getExpectedStats(i);
      const stats = await mfiends.stats(owner.address);
      const contractStats = {
        ruin: stats.ruin.toNumber(),
        guard: stats.guard.toNumber(),
        vigor: stats.vigor.toNumber(),
        celerity: stats.celerity.toNumber(),
      };

      console.log({ contractStats });

      expect(contractStats.ruin).to.equal(expectedStats.ruin);
      expect(contractStats.guard).to.equal(expectedStats.guard);
      expect(contractStats.vigor).to.equal(expectedStats.vigor);
      expect(contractStats.celerity).to.equal(expectedStats.celerity);
    }
  });
});
