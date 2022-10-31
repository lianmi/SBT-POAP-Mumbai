const { ethers, upgrades } = require("hardhat");

const path = require("path");

async function main() {

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const adminAddr1 = "0xBd71Ba19e9567E37f9E239Ec6fb2Ea27894bDb2e";
  
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const baseURI = "https://poapsbt.xyz/token/";
  const poapName = "PoapSBT";
  const FPoap = await ethers.getContractFactory("Poap");
  const contract = await upgrades.deployProxy(FPoap, [poapName, poapName, "https://poapsbt.xyz/token/", [adminAddr1]], { initializer: '__POAP_init' });
  await contract.deployed();

  console.log("Contract address:", contract.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
