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
  const mgearAddress = "0x49D2eCeaf754d1651D1a226D8177a1F977DcD8Bb";
  const onChainPixelArtAddress = "0x3f9dC64A0EE16182E27b44aD5aAe0e89768A64ea";
  const mpunkAddress = "0x7327C9385080944C867417c10978F190fD15fDbB";
  const mwordsAddress = "0xB6654C0Eec75B2Be206f8DA16e806B78d8668C65";

  const MFiends = await ethers.getContractFactory("MFiends");
  const mFiends = await MFiends.deploy(mgearAddress, onChainPixelArtAddress, NO_DIFFICULTY);

  if (verify) {
    console.log(`
    await run("verify:verify", {
      address: "${mFiends.address}",
      constructorArguments: [
        "${mgearAddress}",
        "0xC33fDB912CfB0BC2f9bd88a2Ac37236045ACdE78",
        NO_DIFFICULTY,
      ],
    });`);

    // await run(`verify:verify`, {
    //   address: mFiends.address,
    //   constructorArguments: [mgearAddress, onChainPixelArtAddress, NO_DIFFICULTY],
    // });
  }

  console.log(`REACT_APP_MINEABLE_GEAR_ADDRESS_GOERLI: "${mgearAddress}",

  REACT_APP_MINEABLE_PUNKS_ADDRESS_GOERLI: "${mpunkAddress}",

  REACT_APP_MINEABLE_WORDS_ADDRESS_GOERLI: "${mwordsAddress}",

  REACT_APP_MINEABLE_MONSTERS_ADDRESS_GOERLI: "${mFiends.address}",`);
  return mFiends;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const verifyContract = async () => {
  await run("verify:verify", {
    address: "0x819ccbA0a4b90b694C02389b31d57F2dc2A29536",
    constructorArguments: [
      "0xaBD7d24a364eF2028C98cD247B72Fd10dad367Dc",
      "0xC33fDB912CfB0BC2f9bd88a2Ac37236045ACdE78",
      NO_DIFFICULTY,
    ],
  });
};

// verifyContract();
