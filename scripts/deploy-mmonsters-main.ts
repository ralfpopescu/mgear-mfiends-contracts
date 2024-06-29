// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const DIFFICULTY = BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
).toHexString();

async function main() {
  const onChainPixelArtAddress = "0xC3D6707E421d86E595c01247147320e49887D0ef";
  const mgearAddress = "0x5d070A1c9Acdc38d853D8501F2740FaB9e9B4821";
  const MMonsters = await ethers.getContractFactory("MMonsters");
  const mMonsters = await MMonsters.deploy(mgearAddress, onChainPixelArtAddress, DIFFICULTY);

  console.log("Deployed:", mMonsters.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
