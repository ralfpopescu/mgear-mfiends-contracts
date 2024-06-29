import { deployMGearBattleForEquipTests } from "./util";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, BigNumber } from "ethers";
import { itemsByStrength } from "./items";
import { hash } from "./word-util";
import { getStats, getRarityIndex, randomMgear } from "./mgear";

type StatNames = "ruin" | "guard" | "vigor" | "celerity";

const statTypeToName: StatNames[] = ["ruin", "guard", "vigor", "celerity"];

const fl = async (n: number, callback: (n: number) => Promise<void> | void) => {
  for (let i = 0; i < n; i += 1) {
    await callback(i);
  }
};

const mint = async (
  affinity: number,
  affinityToCheck: number,
  affinityKey: string,
  renders: { [key: string]: string | null },
  mfiends: Contract,
  nonce: BigNumber
) => {
  if (affinityToCheck === affinity && !renders[affinityKey]) {
    const confirmAffinity = await mfiends.affinityToName(affinity);
    console.log("GOT: ", { affinityKey, affinity, confirmAffinity });

    await mfiends.mint(nonce, true, { value: BigNumber.from("50000000000000000") });
    const index = await mfiends.totalSupply();
    console.log("totaly supply: ", index);
    const render = await mfiends.tokenURI(index);
    const parsed = Buffer.from(
      render.split("data:application/json;base64,")[1],
      "base64"
    ).toString();
    console.log(parsed);
    console.log("ATTRIBUTES", JSON.parse(parsed).attributes);
    renders[affinityKey] = render;
  }
};

const equipItems =
  (battle: Contract) =>
  async (player1: number[] = [1, 2, 3, 4]) => {
    await battle.equipItems(player1[0], player1[1], player1[2], player1[3]);
  };

describe.only("end-to-end", function () {
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

    await equipItems(mfiends)([1, 2, 7, 4]);

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

  it("unequip all items", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();

    await equipItems(mfiends)([1, 2, 3, 4]);
    let expectedStats = await getExpectedStatTotal([1, 2, 3, 4], dummyMGear, mfiends);
    let stats = await mfiends.stats(owner.address);

    expect(stats.ruin).to.equal(expectedStats.ruin);
    expect(stats.guard).to.equal(expectedStats.guard);
    expect(stats.vigor).to.equal(expectedStats.vigor);
    expect(stats.celerity).to.equal(expectedStats.celerity);

    await equipItems(mfiends)([0, 0, 0, 0]);

    expectedStats = { ruin: 1, guard: 0, vigor: 10, celerity: 0 };
    stats = await mfiends.stats(owner.address);

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

  it("mint and render one of each", async function () {
    const { mfiends } = await deployMGearBattleForEquipTests();
    const [owner] = await ethers.getSigners();
    await mfiends.connect(owner).equipItems(17, 18, 19, 20);

    const renders: { [key: string]: string | null } = {
      prototypical: null,
      vibrant: null,
      plasmic: null,
      fluid: null,
      organic: null,
      umbral: null,
      luminous: null,
      abyssal: null,
    };

    let counter = 0;
    while (
      !(
        renders.prototypical &&
        renders.vibrant &&
        renders.plasmic &&
        renders.fluid &&
        renders.organic &&
        renders.umbral &&
        renders.luminous &&
        renders.abyssal
      )
    ) {
      counter++;
      if (!(counter % 10)) console.log(counter);
      const nonce = randomMgear().and("0xFFFFFFFF");
      const hashed = hash({ address: BigNumber.from(owner.address), nonce });
      const tokenData = hashed.and("0xFFFFFFFF");
      const affinity = await mfiends.getAffinity(
        hash({ address: BigNumber.from(mfiends.address), nonce: tokenData })
      );

      await mint(affinity.toNumber(), 0, "prototypical", renders, mfiends, nonce);
      await mint(affinity.toNumber(), 1, "vibrant", renders, mfiends, nonce);
      await mint(affinity.toNumber(), 2, "plasmic", renders, mfiends, nonce);
      await mint(affinity.toNumber(), 3, "fluid", renders, mfiends, nonce);
      await mint(affinity.toNumber(), 4, "organic", renders, mfiends, nonce);
      await mint(affinity.toNumber(), 5, "umbral", renders, mfiends, nonce);
      await mint(affinity.toNumber(), 6, "luminous", renders, mfiends, nonce);
      await mint(affinity.toNumber(), 7, "abyssal", renders, mfiends, nonce);
    }

    console.log({ renders });
  });

  it("render and print", async function () {
    const { mfiends } = await deployMGearBattleForEquipTests();
    const count = 4;
    const renders: string[] = [];

    fl(count, async (i) => {
      const affinity = i % 8;
      const render = await mfiends.renderFiend(
        randomMgear().and("0xFFFFFFFF"),
        randomMgear(),
        affinity
      );
      console.log("made one", i);
      renders[i] = render;
      if (i === count - 1) {
        console.log(renders);
      }
    });
  });

  it("render stats", async function () {
    const { mfiends } = await deployMGearBattleForEquipTests();
    const nonce = randomMgear().and("0xFFFFFFFF");

    const [owner] = await ethers.getSigners();
    await mfiends.connect(owner).equipItems(17, 18, 19, 20);

    await mfiends.mint(nonce, true, { value: BigNumber.from("50000000000000000") });

    const result = await mfiends.renderTokenURI(1);
    console.log(result);
  });

  it("equip items", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner, otherGuy] = await ethers.getSigners();
    console.log("!!!", itemsByStrength.length);
    const l = itemsByStrength.length;
    await mfiends.connect(owner).equipItems(1, 2, 3, 4);
    await mfiends.connect(otherGuy).equipItems(1 + l, 2 + l, 3 + l, 4 + l);

    dummyMGear.connect(owner).transferFrom(owner.address, otherGuy.address, 1);

    try {
      await mfiends.connect(owner).mint(1352, false);
      throw new Error("should not throw");
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'eq 0'"
      );
    }

    // equip an item you own
    await mfiends.connect(owner).equipItems(5, 2, 3, 4);

    // owner can mint now
    try {
      await mfiends.connect(owner).mint(1352, false);
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'did not defeat'"
      );
    }
  });

  it("someone else equipping your item should be okay", async function () {
    const { mfiends, dummyMGear } = await deployMGearBattleForEquipTests();
    const [owner, otherGuy] = await ethers.getSigners();

    const l = itemsByStrength.length;
    await mfiends.connect(owner).equipItems(1, 2, 3, 4);
    await mfiends.connect(otherGuy).equipItems(1 + l, 2 + l, 3 + l, 4 + l);

    // send item 1 to other guy
    await dummyMGear.connect(owner).transferFrom(owner.address, otherGuy.address, 1);

    // now other guy equips item 1
    await mfiends.connect(otherGuy).equipItems(1, 2 + l, 3 + l, 4 + l);

    // owner can't mint
    try {
      await mfiends.connect(owner).mint(1352, false);
      throw new Error("should not throw");
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'eq 0'"
      );
    }

    // owner equips a different item
    await mfiends.connect(owner).equipItems(5, 2, 3, 4);

    // owner can mint now
    try {
      await mfiends.connect(owner).mint(1352, false);
    } catch (e: any) {
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'did not defeat'"
      );
    }
  });

  it.only("render stats", async function () {
    const { mfiends } = await deployMGearBattleForEquipTests();
    const nonce = randomMgear().and("0xFFFFFFFF");

    const [owner] = await ethers.getSigners();
    await mfiends.connect(owner).equipItems(17, 18, 19, 20);

    await mfiends.mint(nonce, true, { value: BigNumber.from("50000000000000000") });

    const result = await mfiends.renderTokenURI(1);
    console.log(result);
  });
});
