// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// eslint-disable-next-line import/no-duplicates
import { ethers } from "hardhat";

// @ts-ignore
// eslint-disable-next-line import/no-duplicates
import { deployedAddresses } from "hardhat";
import { BigNumber } from "ethers";

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

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const targetGasPrice = ethers.utils.parseUnits(
    deployedAddresses.targetGasPrice,
    "gwei"
  );
  const maxPriorityFee = ethers.utils.parseUnits("1", "gwei");

  const MGear = await ethers.getContractFactory("MGear");
  const mgear = await MGear.deploy(
    deployedAddresses.mineablePunks,
    deployedAddresses.mineableWords,
    deployedAddresses.mgearv1,
    DIFFICULTY_NORMAL,
    DIFFICULTY_SOLID,
    DIFFICULTY_NOTEWORTHY,
    {
      maxFeePerGas: targetGasPrice,
      maxPriorityFeePerGas: maxPriorityFee,
    }
  );

  await mgear.deployed();

  console.log("mgear deployed to:", mgear.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
