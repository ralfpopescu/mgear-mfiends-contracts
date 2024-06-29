import { deployMGearBattleForEquipTests } from "./util";
import { ethers } from "hardhat";
import { hash } from "./word-util";
import { BigNumber, Contract } from "ethers";
import { randomMgear } from "./mgear";

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

describe("Metadata tests", function () {
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
    const count = 30;
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
});
