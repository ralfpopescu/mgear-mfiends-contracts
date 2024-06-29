import { Contract } from "ethers";
import { ethers } from "hardhat";
import { items, constructMgearWithStatsInput, itemsByStrength } from "./items";
import { deployOnChainPixelArt } from "../scripts/deploy-local";

export const baseStats = { celerity: 0, guard: 0, vigor: 10, ruin: 1 };

const getAdjustedValue = (rarity: number, tier: number, value: number) => {
  if (rarity === 0) {
    if (tier === 0) {
      return value;
    }
    return 0;
  }
  if (rarity === 1) {
    if (tier === 0) {
      return value + 3;
    }
    return 0;
  }
  if (rarity === 2) {
    if (tier === 0) {
      return value + 3;
    }
    if (tier === 1) {
      return value;
    }
    return 0;
  }
  if (rarity === 3) {
    if (tier === 0 || tier === 1) {
      return value + 3;
    }
    return 0;
  }
  if (rarity === 4) {
    if (tier === 0) {
      return value + 6;
    }
    if (tier === 1) {
      return value + 3;
    }
    return value;
  }
  if (rarity === 5) {
    if (tier === 0) {
      return value + 6;
    }
    return value + 3;
  }
  throw new Error("exhaustive");
};

const getStat = (type: number, value: number, rarity: number, tier: number) => {
  const adjustedValue = getAdjustedValue(rarity, tier, value);
  if (type === 0) {
    return { ruin: adjustedValue };
  }
  if (type === 1) {
    return { guard: adjustedValue };
  }
  if (type === 2) {
    return { vigor: adjustedValue };
  }
  return { celerity: adjustedValue };
};

type Stats = {
  celerity?: number;
  ruin?: number;
  vigor?: number;
  guard?: number;
};

const coalesceStats = (stats1: Stats, stats2: Stats): Stats => {
  const celerity = (stats1.celerity || 0) + (stats2.celerity || 0);
  const ruin = (stats1.ruin || 0) + (stats2.ruin || 0);
  const guard = (stats1.guard || 0) + (stats2.guard || 0);
  const vigor = (stats1.vigor || 0) + (stats2.vigor || 0);
  return { ruin, guard, vigor, celerity };
};

export const getStatsFromItems = (items: constructMgearWithStatsInput[]) => {
  let stats: Stats = { celerity: 0, guard: 0, vigor: 10, ruin: 1 };
  console.log(items);

  items.forEach((item) => {
    const { rarity, majorType, minor1Type, minor2Type, majorValue, minor1Value, minor2Value } =
      item;
    const majorStat = getStat(majorType, majorValue, item.rarity, 0);
    const minor1Stat = getStat(minor1Type, minor1Value, item.rarity, 1);
    const minor2Stat = getStat(minor2Type, minor2Value, item.rarity, 2);

    if (rarity < 2) {
      stats = coalesceStats(stats, majorStat);
    } else if (rarity < 4) {
      stats = coalesceStats(stats, majorStat);
      stats = coalesceStats(stats, minor1Stat);
    } else {
      stats = coalesceStats(stats, majorStat);
      stats = coalesceStats(stats, minor1Stat);
      stats = coalesceStats(stats, minor2Stat);
    }
  });

  return stats;
};

export const deployMGearBattle = async (): Promise<Contract> => {
  const DummyMGear = await ethers.getContractFactory("DummyMGear");
  const dummyMGear = await DummyMGear.deploy();

  const [owner, addr1] = await ethers.getSigners();

  await dummyMGear.mint(1, items[0], owner.address);
  await dummyMGear.mint(2, items[1], owner.address);
  await dummyMGear.mint(3, items[2], owner.address);
  await dummyMGear.mint(4, items[3], owner.address);

  await dummyMGear.mint(5, items[0], addr1.address);
  await dummyMGear.mint(6, items[1], addr1.address);
  await dummyMGear.mint(7, items[2], addr1.address);
  await dummyMGear.mint(8, items[3], addr1.address);

  const MGearBattle = await ethers.getContractFactory("MGearBattle");
  const mgearBattle = await MGearBattle.deploy(dummyMGear.address);

  console.log(mgearBattle.deployTransaction.gasLimit);

  return mgearBattle;
};

export const deployMGearBattleForEquipTests = async () => {
  console.log("HI1");
  const DummyMGear = await ethers.getContractFactory("DummyMGear");
  const dummyMGear = await DummyMGear.deploy();

  const [owner, addr1] = await ethers.getSigners();

  console.log("HI2");
  await Promise.all(
    itemsByStrength.map((item, i) => {
      const itemId = i + 1;
      console.log({ itemId, item });
      dummyMGear.mint(i + 1, item, owner.address);
    })
  );
  await Promise.all(
    itemsByStrength.map((item, i) =>
      dummyMGear.mint(i + itemsByStrength.length + 1, item, addr1.address)
    )
  );
  console.log("HI3");
  const ArrayLibrary = await ethers.getContractFactory("Array");
  const arrayLibrary = await ArrayLibrary.deploy();
  await arrayLibrary.deployed();

  console.log("HI4");
  const onChainPixelArt = await deployOnChainPixelArt();

  const MFiends = await ethers.getContractFactory("MFiends");
  const mfiends = await MFiends.deploy(
    dummyMGear.address,
    onChainPixelArt.address,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );
  console.log("HI8");

  console.log(mfiends.deployTransaction.gasLimit);

  return { mfiends, dummyMGear };
};

const deployOnChainPixelArtv2 = async () => {
  const ArrayLibrary = await ethers.getContractFactory("Array");
  const arrayLibrary = await ArrayLibrary.deploy();
  await arrayLibrary.deployed();

  const OnChainPixelArtLibrary = await ethers.getContractFactory("OnChainPixelArtLibrary", {
    libraries: {
      Array: arrayLibrary.address,
    },
  });

  const onChainPixelArtLibrary = await OnChainPixelArtLibrary.deploy();
  await onChainPixelArtLibrary.deployed();

  const OnChainPixelArtLibraryv2 = await ethers.getContractFactory("OnChainPixelArtLibraryv2", {
    libraries: {
      Array: arrayLibrary.address,
      OnChainPixelArtLibrary: onChainPixelArtLibrary.address,
    },
  });

  const onChainPixelArtLibraryv2 = await OnChainPixelArtLibraryv2.deploy();
  await onChainPixelArtLibrary.deployed();

  const libraries = {
    OnChainPixelArtLibrary: onChainPixelArtLibrary.address,
    OnChainPixelArtLibraryv2: onChainPixelArtLibraryv2.address,
  };

  const Renderer = await ethers.getContractFactory("OnChainPixelArtv2", {
    libraries,
  });
  const renderer = await Renderer.deploy();
  await renderer.deployed();
  return renderer;
};

export const deployMFiends = async (): Promise<Contract> => {
  const DummyMGear = await ethers.getContractFactory("DummyMGear");
  const dummyMGear = await DummyMGear.deploy();

  const [owner, addr1] = await ethers.getSigners();

  await dummyMGear.mint(1, items[0], owner.address);
  await dummyMGear.mint(2, items[1], owner.address);
  await dummyMGear.mint(3, items[2], owner.address);
  await dummyMGear.mint(4, items[3], owner.address);

  await dummyMGear.mint(5, items[0], addr1.address);
  await dummyMGear.mint(6, items[1], addr1.address);
  await dummyMGear.mint(7, items[2], addr1.address);
  await dummyMGear.mint(8, items[3], addr1.address);

  const ArrayLibrary = await ethers.getContractFactory("Array");
  const arrayLibrary = await ArrayLibrary.deploy();
  await arrayLibrary.deployed();

  const onChainPixelArtLibrary = await deployOnChainPixelArtv2();

  const OnChainPixelArt = await ethers.getContractFactory("OnChainPixelArtv2", {
    libraries: {
      OnChainPixelArtLibrary: onChainPixelArtLibrary.address,
    },
  });
  const onChainPixelArt = await OnChainPixelArt.deploy();
  await onChainPixelArt.deployed();

  const MFiends = await ethers.getContractFactory("MFiends");
  const mfiends = await MFiends.deploy(
    dummyMGear.address,
    onChainPixelArt.address,
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  );

  console.log(mfiends.deployTransaction.gasLimit);

  return mfiends;
};
