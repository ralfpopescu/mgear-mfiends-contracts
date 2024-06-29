import { BigNumber } from "@ethersproject/bignumber";
import { randomBytes } from "ethers/lib/utils";

export const randomMgear = () => BigNumber.from(randomBytes(32));

const StatTypes = {
  RUIN: 0,
  GUARD: 1,
  VIGOR: 2,
  CELERITY: 3,
};

export type constructMgearWithStatsInput = {
  rarity: number;
  majorType: number;
  minor1Type: number;
  minor2Type: number;
  majorValue: number;
  minor1Value: number;
  minor2Value: number;
};

export const constructMgearStats = ({
  rarity,
  majorType,
  minor1Type,
  minor2Type,
  majorValue,
  minor1Value,
  minor2Value,
}: constructMgearWithStatsInput) => {
  const _rarity = BigNumber.from(rarity);
  const _majorType = BigNumber.from(majorType).shl(19);
  const _minor1Type = BigNumber.from(minor1Type).shl(21);
  const _minor2Type = BigNumber.from(minor2Type).shl(23);
  const _majorValue = BigNumber.from(majorValue % 4).shl(25);
  const _minor1Value = BigNumber.from(minor1Value % 4).shl(27);
  const _minor2Value = BigNumber.from(minor2Value % 4).shl(29);

  const random = randomMgear().and(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFE0007FFFFFFFFFFFFFF00000000000000000"
  );

  const added = random
    .add(_minor2Value)
    .add(_minor1Value)
    .add(_majorValue)
    .add(_minor2Type)
    .add(_minor1Type)
    .add(_majorType)
    .add(_rarity);

  console.log("here", added.and("0x7").toNumber());

  return added;
};

const ruinItemMeta = {
  rarity: 5,
  majorType: StatTypes.RUIN,
  minor1Type: StatTypes.GUARD,
  minor2Type: StatTypes.CELERITY,
  majorValue: 3,
  minor1Value: 3,
  minor2Value: 3,
};

const guardItemMeta = {
  rarity: 5,
  majorType: StatTypes.GUARD,
  minor1Type: StatTypes.VIGOR,
  minor2Type: StatTypes.CELERITY,
  majorValue: 3,
  minor1Value: 3,
  minor2Value: 3,
};

const vigorItemMeta = {
  rarity: 5,
  majorType: StatTypes.VIGOR,
  minor1Type: StatTypes.RUIN,
  minor2Type: StatTypes.GUARD,
  majorValue: 3,
  minor1Value: 3,
  minor2Value: 3,
};

const celerityItemMeta = {
  rarity: 5,
  majorType: StatTypes.CELERITY,
  minor1Type: StatTypes.RUIN,
  minor2Type: StatTypes.GUARD,
  majorValue: 3,
  minor1Value: 3,
  minor2Value: 3,
};

export const ruinItem = constructMgearStats(ruinItemMeta);
export const guardItem = constructMgearStats(guardItemMeta);
export const celerityItem = constructMgearStats(celerityItemMeta);
export const vigorItem = constructMgearStats(vigorItemMeta);

export const items = [ruinItem, guardItem, celerityItem, vigorItem];
export const itemsMeta = [ruinItemMeta, guardItemMeta, vigorItemMeta, celerityItemMeta];

export const ruinItemTier1 = constructMgearStats({
  rarity: 2,
  majorType: StatTypes.RUIN,
  minor1Type: StatTypes.GUARD,
  minor2Type: StatTypes.CELERITY,
  majorValue: 2,
  minor1Value: 2,
  minor2Value: 2,
});

export const guardItemTier1 = constructMgearStats({
  rarity: 2,
  majorType: StatTypes.GUARD,
  minor1Type: StatTypes.VIGOR,
  minor2Type: StatTypes.CELERITY,
  majorValue: 2,
  minor1Value: 2,
  minor2Value: 2,
});

export const celerityItemTier1 = constructMgearStats({
  rarity: 2,
  majorType: StatTypes.CELERITY,
  minor1Type: StatTypes.RUIN,
  minor2Type: StatTypes.GUARD,
  majorValue: 2,
  minor1Value: 2,
  minor2Value: 2,
});

export const vigorItemTier1 = constructMgearStats({
  rarity: 2,
  majorType: StatTypes.VIGOR,
  minor1Type: StatTypes.RUIN,
  minor2Type: StatTypes.GUARD,
  majorValue: 2,
  minor1Value: 2,
  minor2Value: 2,
});

export const itemsTier1 = [ruinItemTier1, guardItemTier1, vigorItemTier1, celerityItemTier1];

export const itemsByStrength = [1, 2, 3, 4, 5]
  .map((value) => [
    constructMgearStats({
      rarity: value,
      majorType: StatTypes.RUIN,
      minor1Type: StatTypes.GUARD,
      minor2Type: StatTypes.VIGOR,
      majorValue: 3,
      minor1Value: 3,
      minor2Value: 3,
    }),
    constructMgearStats({
      rarity: value,
      majorType: StatTypes.GUARD,
      minor1Type: StatTypes.VIGOR,
      minor2Type: StatTypes.CELERITY,
      majorValue: 3,
      minor1Value: 3,
      minor2Value: 3,
    }),
    constructMgearStats({
      rarity: value,
      majorType: StatTypes.VIGOR,
      minor1Type: StatTypes.CELERITY,
      minor2Type: StatTypes.RUIN,
      majorValue: 3,
      minor1Value: 3,
      minor2Value: 3,
    }),
    constructMgearStats({
      rarity: value,
      majorType: StatTypes.CELERITY,
      minor1Type: StatTypes.RUIN,
      minor2Type: StatTypes.GUARD,
      majorValue: 3,
      minor1Value: 3,
      minor2Value: 3,
    }),
  ])
  .reduce((acc, curr) => [...acc, ...curr]);

itemsTier1.forEach((item) => console.log("2", item._hex));
