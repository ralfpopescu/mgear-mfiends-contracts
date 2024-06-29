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

// real difficulties
const DIFFICULTY_NORMAL = BigNumber.from(
  "0x0000003fffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
).toHexString();

const DIFFICULTY_SOLID = BigNumber.from(
  "0x0000001effffffffffffffffffffffffffffffffffffffffffffffffffffffff"
).toHexString();

const DIFFICULTY_NOTEWORTHY = BigNumber.from(
  "0x0000000fffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
).toHexString();

// Rinkeby
const MINEABLE_PUNKS_ADDRESS = "0xF676B56ce0BDf0a17E4460E506a875dc0abB1FC5";
const MINEABLE_WORDS_ADDRESS = "0xA9714Cd285168596cCBb39b535C0C628fc6C2B09";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const deployedMgearAddress = "0xCf448c8a0D544A7D9B2d77f48090f31248073afd";

  const MGear = await ethers.getContractFactory("MGear");

  const noDifficulty = false;
  let mgear;

  if (noDifficulty) {
    mgear = await MGear.deploy(
      MINEABLE_PUNKS_ADDRESS,
      MINEABLE_WORDS_ADDRESS,
      deployedMgearAddress,
      NO_DIFFICULTY,
      NO_DIFFICULTY,
      NO_DIFFICULTY
    );
  } else {
    mgear = await MGear.deploy(
      MINEABLE_PUNKS_ADDRESS,
      MINEABLE_WORDS_ADDRESS,
      deployedMgearAddress,
      DIFFICULTY_NORMAL,
      DIFFICULTY_SOLID,
      DIFFICULTY_NOTEWORTHY
    );
  }

  console.log("Deployed:");
  console.log(mgear);
  return mgear;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
