// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, run } from "hardhat";
import { BigNumber } from "ethers";

const NO_DIFFICULTY = BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
).toHexString();

const verify = true;

async function main() {
  const MPunks = await ethers.getContractFactory("DummyMineablePunks");
  const mpunks = await MPunks.deploy();
  const mpunkAddress = mpunks.address;
  const MWords = await ethers.getContractFactory("DummyMineableWords");
  const mwords = await MWords.deploy();
  const mwordsAddress = mwords.address;

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

  const mgearAddress = mgear.address;

  const onChainPixelArtAddress = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";

  const MFiends = await ethers.getContractFactory("MFiends");
  const mFiends = await MFiends.deploy(mgearAddress, onChainPixelArtAddress, NO_DIFFICULTY);

  console.log("Deployed:", {
    mpunks: mpunkAddress,
    mwords: mwordsAddress,
    mgear: mgearAddress,
    onChainPixelArt: onChainPixelArtAddress,
    fiends: mFiends.address,
  });

  console.log(`REACT_APP_MINEABLE_GEAR_ADDRESS_LOCAL: "${mgearAddress}",

  REACT_APP_MINEABLE_PUNKS_ADDRESS_LOCAL: "${mpunkAddress}",

  REACT_APP_MINEABLE_WORDS_ADDRESS_LOCAL: "${mwordsAddress}",

  REACT_APP_MINEABLE_MONSTERS_ADDRESS_LOCAL: "${mFiends.address}",`);
  return mFiends;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// verifyContract();
