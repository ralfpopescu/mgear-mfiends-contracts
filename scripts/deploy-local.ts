// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const NO_DIFFICULTY = BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
).toHexString();

const existing = {
  mpunks: "0x998abeb3E57409262aE5b751f60747921B33613E",
  mwords: "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
  mgear: "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF",
  onChainPixelArt: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  monsters: "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d",
};

export const deployOnChainPixelArt = async () => {
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
  await onChainPixelArtLibraryv2.deployed();

  const OnChainPixelArt = await ethers.getContractFactory("OnChainPixelArtv2", {
    libraries: {
      OnChainPixelArtLibrary: onChainPixelArtLibrary.address,
      OnChainPixelArtLibraryv2: onChainPixelArtLibraryv2.address,
    },
  });
  const onChainPixelArtv2 = await OnChainPixelArt.deploy();
  await onChainPixelArtv2.deployed();

  console.log(
    "WHYYYY",
    arrayLibrary.address,
    onChainPixelArtLibrary.address,
    onChainPixelArtLibraryv2.address
  );

  return onChainPixelArtv2;
};

async function main() {
  const useExisting = false;

  let mpunkAddress = existing.mpunks;
  let mwordsAddress = existing.mwords;
  let mgearAddress = existing.mgear;
  let onChainPixelArtAddress = existing.onChainPixelArt;

  if (!useExisting) {
    const MPunks = await ethers.getContractFactory("DummyMineablePunks");
    const mpunks = await MPunks.deploy();
    mpunkAddress = mpunks.address;
    const MWords = await ethers.getContractFactory("DummyMineableWords");
    const mwords = await MWords.deploy();
    mwordsAddress = mwords.address;

    const Renderer = await ethers.getContractFactory("Renderer");
    const renderer = await Renderer.deploy();
    const OldMGear = await ethers.getContractFactory("OldMGear");
    const oldMgear = await OldMGear.deploy(
      mpunks.address,
      mwords.address,
      renderer.address,
      NO_DIFFICULTY,
      NO_DIFFICULTY,
      NO_DIFFICULTY
    );

    const MGear = await ethers.getContractFactory("MGear");

    const mgear = await MGear.deploy(
      mpunks.address,
      mwords.address,
      oldMgear.address,
      NO_DIFFICULTY,
      NO_DIFFICULTY,
      NO_DIFFICULTY
    );

    mgearAddress = mgear.address;

    const ArrayLibrary = await ethers.getContractFactory("Array");
    const arrayLibrary = await ArrayLibrary.deploy();
    await arrayLibrary.deployed();

    const onChainPixelArt = await deployOnChainPixelArt();

    onChainPixelArtAddress = onChainPixelArt.address;
    console.log("!!!", { onChainPixelArtAddress });
  }

  const MMonsters = await ethers.getContractFactory("MMonsters");
  const mMonsters = await MMonsters.deploy(mgearAddress, onChainPixelArtAddress, NO_DIFFICULTY);

  console.log("Deployed:", {
    mpunks: mpunkAddress,
    mwords: mwordsAddress,
    mgear: mgearAddress,
    onChainPixelArt: onChainPixelArtAddress,
    monsters: mMonsters.address,
  });

  console.log(`REACT_APP_MINEABLE_GEAR_ADDRESS_LOCAL: "${mgearAddress}",

  REACT_APP_MINEABLE_PUNKS_ADDRESS_LOCAL: "${mpunkAddress}",

  REACT_APP_MINEABLE_WORDS_ADDRESS_LOCAL: "${mwordsAddress}",

  REACT_APP_MINEABLE_MONSTERS_ADDRESS_LOCAL: "${mMonsters.address}",`);
  return mMonsters;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
