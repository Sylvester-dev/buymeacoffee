const { ethers } = require("ethers");
const hre = require("hardhat");

const main = async () => {

  // This will actually compile our contract and generate the necessary files we need to work with our contract under the artifacts directory.
    const coffeeContractFactory = await hre.ethers.getContractFactory('CoffeePortal');
    const coffeeContract = await coffeeContractFactory.deploy({value:hre.ethers.utils.parseEther("0.01"),});
  
    await coffeeContract.deployed(); // We'll wait until our contract is officially deployed to our local blockchain! Our constructor runs when we actually deploy.
  
   console.log("Coffee Contract deployed to:", coffeeContract.address);
   
   let contractBalance = await hre.ethers.provider.getBalance(coffeeContract.address); //getting contract balance
   console.log("contract balance: ",hre.ethers.utils.formatEther(contractBalance));

   //let buy a coffee
   const coffeeTxn = await coffeeContract.buyCoffee("Coffee is tasty", "3lv", ethers.utils.parseEther("0.001"));
   await coffeeTxn.wait();

   contractBalance = await hre.ethers.provider.getBalance(coffeeContract.address); //getting contract balance
   console.log("contract balance: ",hre.ethers.utils.formatEther(contractBalance));

   let allCoffee = await coffeeContract.getAllCoffee();
   console.log(allCoffee);

  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();