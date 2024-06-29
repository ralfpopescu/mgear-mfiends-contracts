import { deployMFiends } from "./util";
import { BigNumber } from "ethers";

enum Affinity {
  PROTOTYPICAL,
  VIBRANT,
  PLASMIC,
  FLUID,
  ORGANIC,
  UMBRAL,
  LUMINOUS,
  ABYSSAL,
}

const affinityToRoll = {
  [Affinity.PROTOTYPICAL]: 30,
  [Affinity.VIBRANT]: 23,
  [Affinity.ORGANIC]: 13,
  [Affinity.FLUID]: 11,
  [Affinity.PLASMIC]: 7,
  [Affinity.LUMINOUS]: 3,
  [Affinity.UMBRAL]: 1,
  [Affinity.ABYSSAL]: 0,
};

type fiendInput = {
  bodyId: number;
  armId: number;
  legId: number;
  backId: number;
  headId: number;
  runeId: number;
  hasRune: boolean;
  hasBack: boolean;
};

const loop = async (n: number, f: (i: number) => Promise<void>) => {
  for (let i = 0; i < n; i += 1) {
    await f(i);
  }
};

const createFiend = (input: fiendInput) => {
  let tokenData = BigNumber.from(0);

  if (!input.hasRune) {
    tokenData = tokenData.add(BigNumber.from(2).shl(28));
  }

  if (!input.hasBack) {
    tokenData = tokenData.add(BigNumber.from(2).shl(24));
  }

  tokenData = tokenData
    .add(BigNumber.from(input.runeId).shl(20))
    .add(BigNumber.from(input.legId).shl(16))
    .add(BigNumber.from(input.headId).shl(12))
    .add(BigNumber.from(input.bodyId).shl(8))
    .add(BigNumber.from(input.backId).shl(4))
    .add(BigNumber.from(input.armId));

  return tokenData;
};

describe("Renderer", function () {
  it("renders fiends", async function () {
    const mfiends = await deployMFiends();
    const palette = "0xb59873532f900f2eaf39db609d6e9b0a36114c480b0ae17966678864dd9254c3";
    // 10 back looks broke
    await loop(16, async (i) => {
      const fiend = createFiend({
        bodyId: i,
        armId: i,
        legId: i,
        backId: i,
        headId: i,
        runeId: i,
        hasRune: true,
        hasBack: true,
      });

      const render = await mfiends.renderFiend(fiend, palette, i % 7);
      console.log("RENDERED ", i, ": ", render);
    });
  });

  it("problematic", async function () {
    const mfiends = await deployMFiends();
    const palette = "0xb59873532f900f2eaf39db609d6e9b0a36114c480b0ae17966678864dd9254c3";

    const traits = BigNumber.from("0xa4eae0a8");
    const render = await mfiends.renderFiend(traits, palette, 7);
    console.log("RENDERED: ", render);
  });
});
