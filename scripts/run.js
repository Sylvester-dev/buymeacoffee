const hre = require("hardhat");

async function main() {
  const coffeeContractFactory = await hre.ethers.getContractFactory('CoffeePortal');
  const coffeeContract = await coffeeContractFactory.deploy();

  // We'll wait until our contract is officially deployed to our local blockchain! Our constructor runs when we actually deploy.
  await coffeeContract.deployed(); 

  console.log("Coffee Contract deployed to:", coffeeContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
