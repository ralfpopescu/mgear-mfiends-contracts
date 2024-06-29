// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const DIFFICULTY = BigNumber.from(
  "0x000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
).toHexString();

async function main() {
  const mgearAddress = "0x5d070A1c9Acdc38d853D8501F2740FaB9e9B4821";
  const onChainPixelArtAddress = "0xfCBaD2f45676397792381612913491321E2aad75";

  const MFiends = await ethers.getContractFactory("MFiends");
  const mFiends = await MFiends.deploy(mgearAddress, onChainPixelArtAddress, DIFFICULTY);

  console.log(`REACT_APP_MINEABLE_GEAR_ADDRESS_GOERLI: "${mgearAddress}",

  REACT_APP_MINEABLE_MONSTERS_ADDRESS_GOERLI: "${mFiends.address}",`);
  return mFiends;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
