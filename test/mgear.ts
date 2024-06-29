import { BigNumber } from "ethers";
import { randomBytes } from "@ethersproject/random";

export const rarityIndexToRarityName = [
  "normal",
  "solid",
  "noteworthy",
  "extraordinary",
  "fabled",
  "unreal",
];

export enum RarityIndex {
  FLIMSY,
  SOLID,
  NOTEWORTHY,
  EXTRAORDINARY,
  FABLED,
  UNREAL,
}

export const bottomStyle = {
  display: "grid",
  gridTemplateRows: "repeat(auto-fit, minmax(80px, 200px))",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  padding: "24px",
  overflow: "visible",
  gridGap: "32px",
  width: "100%",
};

type Stats = "ruin" | "guard" | "vigor" | "celerity";

export const statIndexToStatName: Stats[] = ["ruin", "guard", "vigor", "celerity"];

export const rarityToColor = {
  flimsy: "#6B7D7D",
  solid: "#8EAF9D",
  noteworthy: "#9984D4",
  extraordinary: "#FFC857",
  fabled: "#D65780",
  unreal: "#34e4ea",
};

const rareMpunkRollToRarity = [RarityIndex.UNREAL, RarityIndex.FABLED, RarityIndex.EXTRAORDINARY];

export const getStatTypes = (mgear: BigNumber) => {
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

export const getGearType = (mgear: BigNumber) => getStatTypes(mgear).major;

export const getStatValues = (mgear: BigNumber) => {
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

export const getRarityIndex = (mgear: BigNumber) => {
  const mask = BigNumber.from("0x7");
  return mgear.and(mask).toNumber();
};

export const getBonusMod = (mgear: BigNumber) => {
  const mask = BigNumber.from("0x3");
  return mgear.shr(17).and(mask).toNumber() === 0;
};

const rarityToVariationMod: number[] = [];

rarityToVariationMod.push(2);
rarityToVariationMod.push(3);
rarityToVariationMod.push(4);
rarityToVariationMod.push(6);
rarityToVariationMod.push(8);
rarityToVariationMod.push(8);

export type MGearTypes =
  | "dagger"
  | "bow"
  | "staff"
  | "scimitar"
  | "katana"
  | "bowstaff"
  | "axe"
  | "muramasa"
  | "shirt"
  | "helmet"
  | "buckler"
  | "robes"
  | "straps"
  | "chainmail"
  | "kiteshield"
  | "platebody"
  | "ring"
  | "trinket"
  | "amulet"
  | "gauntlets"
  | "orb"
  | "crown"
  | "heart"
  | "artifact"
  | "boots"
  | "pants"
  | "cape"
  | "specs"
  | "crystal"
  | "hat"
  | "sandals"
  | "wings";

const weapons: MGearTypes[] = [
  "dagger",
  "bow",
  "staff",
  "scimitar",
  "katana",
  "bowstaff",
  "axe",
  "muramasa",
];
const armor: MGearTypes[] = [
  "shirt",
  "helmet",
  "buckler",
  "robes",
  "straps",
  "chainmail",
  "kiteshield",
  "platebody",
];
const health: MGearTypes[] = [
  "ring",
  "trinket",
  "amulet",
  "gauntlets",
  "orb",
  "crown",
  "heart",
  "artifact",
];
const celerity: MGearTypes[] = [
  "boots",
  "pants",
  "cape",
  "specs",
  "crystal",
  "hat",
  "sandals",
  "wings",
];

const mgearTypeNames: MGearTypes[][] = [weapons, armor, health, celerity];

export const getVariation = (mgear: BigNumber, rarityIndex?: number) => {
  const mask = BigNumber.from("0x7");
  const variation = mgear.shr(3).and(mask).toNumber();
  const rarity = rarityIndex !== undefined ? rarityIndex : getRarityIndex(mgear);
  const bonusMod = getBonusMod(mgear) ? 2 : 0;

  return variation % (rarityToVariationMod[rarity] + bonusMod);
};

const rarityToUpgradeRoll: number[][] = [];

rarityToUpgradeRoll.push([1, 4, 8]);
rarityToUpgradeRoll.push([2, 8, 16]);
rarityToUpgradeRoll.push([4, 16, 32]);

export const getAdjustedRarity = (mgear: BigNumber, rarityIndex?: RarityIndex) => {
  const rarity = rarityIndex !== undefined ? rarityIndex : getRarityIndex(mgear);
  const mask = BigNumber.from("0xff");
  const upgradeRoll = mgear.shr(9).and(mask).toNumber();

  if (rarity > RarityIndex.NOTEWORTHY) return rarity;

  //TODO: && unrealUpgrades < 16
  if (upgradeRoll < rarityToUpgradeRoll[rarity][0]) {
    return RarityIndex.UNREAL;
  }
  //TODO: && fabledUpgrades < 64
  if (upgradeRoll < rarityToUpgradeRoll[rarity][1]) {
    return RarityIndex.FABLED;
  }
  //TODO: && extraordinaryUpgrades < 128
  if (upgradeRoll < rarityToUpgradeRoll[rarity][2]) {
    return RarityIndex.EXTRAORDINARY;
  }
  return rarity;
};

export const encodeMGear = (mgear: BigNumber, rarity: RarityIndex) => {
  const mask = "0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8";
  return mgear.and(mask).add(BigNumber.from(rarity));
};

export const getIsAugmented = (mgear: BigNumber) => {
  const mask = BigNumber.from("0x7");
  return mgear.shr(6).and(mask).toNumber() === 0;
};

export const getMGearTypeName = (mgear: BigNumber) => {
  const gearType = getStatTypes(mgear).major;
  const variation = getVariation(mgear);
  return mgearTypeNames[gearType][variation];
};

// 1 tier 1 stat
// 1 tier 2 stat
// 1 tier 2 stat, 1 tier 1 stat
// 2 tier 2 stats
// 1 tier 3 stat, 1 tier 2 stat, 1 tier 1 stat
// 1 tier 3 stat, 2 tier 2 stats

const TIER2_BOOST = 3;
const TIER3_BOOST = 6;

export type MGearStats = { [key: string]: number };

export type PlayerStats = { ruin: number; guard: number; vigor: number; celerity: number };

export const getStats = (mgear: BigNumber, rarityIndex?: number): MGearStats => {
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

export const getStatTotal = (mgear: BigNumber, rarityIndex?: number): number => {
  const stats = getStats(mgear, rarityIndex);
  return Object.values(stats).reduce((acc, curr) => acc + curr);
};

export const rarityIndexToColor = [
  "#6B7D7D", //107, 125, 125
  "#4FB286", //79, 178, 134
  "#256EFF", //rgb(37, 110, 255)
  "#FFE66D", //rgb(255, 230, 109)
  "#E980FC", //rgb(233, 128, 252)
  "#87F5FB", //rgb(135, 245, 251)
];

export const getColorsFromMgear = (mgear: BigNumber, rarityIndex?: number, augmented?: boolean) => {
  const startingBit = 36;
  const rarity = rarityIndex !== undefined ? rarityIndex : getRarityIndex(mgear);

  const colorMask = BigNumber.from("0xFF");
  const r1 = mgear.shr(startingBit).and(colorMask);
  const g1 = mgear.shr(startingBit + 8).and(colorMask);
  const b1 = mgear.shr(startingBit + 8 * 2).and(colorMask);
  const color1 = `rgb(${r1}, ${g1}, ${b1})`;

  const r2 = mgear.shr(startingBit + 8 * 3).and(colorMask);
  const g2 = mgear.shr(startingBit + 8 * 4).and(colorMask);
  const b2 = mgear.shr(startingBit + 8 * 5).and(colorMask);
  let color2 = `rgb(${r2}, ${g2}, ${b2})`;

  const r3 = mgear.shr(startingBit + 8 * 6).and(colorMask);
  const g3 = mgear.shr(startingBit + 8 * 7).and(colorMask);
  const b3 = mgear.shr(startingBit + 8 * 8).and(colorMask);
  let color3 = `rgb(${r3}, ${g3}, ${b3})`;

  //augmented color
  const r4 = mgear.shr(startingBit + 8 * 9).and(colorMask);
  const g4 = mgear.shr(startingBit + 8 * 10).and(colorMask);
  const b4 = mgear.shr(startingBit + 8 * 11).and(colorMask);

  const isAugmented = augmented !== undefined ? augmented : getIsAugmented(mgear);
  let color4 = isAugmented ? `rgb(${r4}, ${g4}, ${b4})` : "none";

  if (rarity < RarityIndex.NOTEWORTHY) {
    color2 = color1;
    color3 = color1;
  } else if (rarity < RarityIndex.FABLED) {
    color3 = color1;
  }

  return ["none", rarityIndexToColor[rarity], color1, color2, color3, color4];
};

export const randomMgear = () => BigNumber.from(randomBytes(32));

type constructMgearInput = {
  rarity: number;
  variation: number;
  gearType: number;
  augmented: boolean;
  boosted: boolean;
};

export const constructMgear = ({
  rarity,
  variation,
  gearType,
  augmented,
  boosted,
}: constructMgearInput) => {
  const _gearType = BigNumber.from(gearType).shl(19);
  const _boosted = BigNumber.from(boosted ? 0 : 1).shl(17);
  const _unupgraded = BigNumber.from("0xfe").shl(9);
  const _augmented = BigNumber.from(augmented ? 0 : 1).shl(6);
  const _variation = BigNumber.from(variation).shl(3);
  const _rarity = BigNumber.from(rarity);

  const random = randomMgear().and(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFE0007FFFFFFFFFFFFFFFFFFFFFFFFFe00000"
  );

  const added = random
    .add(_gearType)
    .add(_boosted)
    .add(_unupgraded)
    .add(_augmented)
    .add(_variation)
    .add(_rarity);

  return added;
};

const gearQualities = {
  POOR: "poor",
  OKAY: "okay",
  GOOD: "good",
  GREAT: "great",
  EXCELLENT: "excellent",
  IMMACULATE: "immaculate",
};

export const getGearQuality = (rarity: number, statTotal: number) => {
  if (rarity === RarityIndex.FLIMSY) {
    // min 0, max 3
    if (statTotal === 0) return gearQualities.POOR;
    if (statTotal === 1) return gearQualities.OKAY;
    if (statTotal === 2) return gearQualities.GOOD;
    return gearQualities.GREAT;
  }
  if (rarity === RarityIndex.SOLID) {
    // min 3, max 6
    if (statTotal === 3) return gearQualities.POOR;
    if (statTotal === 4) return gearQualities.OKAY;
    if (statTotal === 5) return gearQualities.GOOD;
    return gearQualities.GREAT;
  }
  if (rarity === RarityIndex.NOTEWORTHY) {
    // min 3, max 9
    if (statTotal === 3) return gearQualities.POOR;
    if (statTotal <= 5) return gearQualities.OKAY;
    if (statTotal <= 7) return gearQualities.GOOD;
    if (statTotal <= 8) return gearQualities.GREAT;
    return gearQualities.EXCELLENT;
  }
  if (rarity === RarityIndex.EXTRAORDINARY) {
    // min 6, max 12
    if (statTotal === 6) return gearQualities.POOR;
    if (statTotal <= 8) return gearQualities.OKAY;
    if (statTotal <= 9) return gearQualities.GOOD;
    if (statTotal <= 11) return gearQualities.GREAT;
    return gearQualities.EXCELLENT;
  }
  if (rarity === RarityIndex.FABLED) {
    // min 9, max 18
    if (statTotal === 9) return gearQualities.POOR;
    if (statTotal <= 11) return gearQualities.OKAY;
    if (statTotal <= 13) return gearQualities.GOOD;
    if (statTotal <= 14) return gearQualities.GREAT;
    if (statTotal <= 16) return gearQualities.EXCELLENT;
    return gearQualities.IMMACULATE;
  }
  if (rarity === RarityIndex.UNREAL) {
    // min 12, max 21
    if (statTotal === 12) return gearQualities.POOR;
    if (statTotal <= 14) return gearQualities.OKAY;
    if (statTotal <= 16) return gearQualities.GOOD;
    if (statTotal <= 17) return gearQualities.GREAT;
    if (statTotal <= 19) return gearQualities.EXCELLENT;
    return gearQualities.IMMACULATE;
  }
};

export const getStatsFromItem = (
  mgear: { mgear: BigNumber; name: string; attributes: { trait_type: string; value: string }[] }[]
) => {
  const stats = { celerity: 0, vigor: 0, ruin: 0, guard: 0 };

  mgear.forEach((m) => {
    console.log(m);
    const { attributes } = m;

    const celerity = attributes.find((a) => a.trait_type === "celerity");
    if (celerity !== undefined) stats.celerity = stats.celerity + parseInt(celerity.value);

    const ruin = attributes.find((a) => a.trait_type === "ruin");
    if (ruin !== undefined) stats.ruin = stats.ruin + parseInt(ruin.value);

    const guard = attributes.find((a) => a.trait_type === "guard");
    if (guard !== undefined) stats.guard = stats.guard + parseInt(guard.value);

    const vigor = attributes.find((a) => a.trait_type === "vigor");
    if (vigor !== undefined) stats.vigor = stats.vigor + parseInt(vigor.value);
  });

  return stats;
};
