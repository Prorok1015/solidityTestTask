const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const voitManagerContract = await hre.ethers.getContractFactory("VoitManager", owner);
  const voitManager = await voitManagerContract.deploy();

  await voitManager.deployed();

  console.log("VoitManager deployed to:", voitManager.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
