// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CoffeePortal {
    
    uint256 totalCoffee;
    address payable public owner;

    event NewCoffee(
        address indexed from,
        string message,
        uint256 timestamp,
        string name
    );

    constructor() payable {
        console.log("Yo Yo! Iis a Smart Contract hehe");
        //user calling this function
        owner = payable(msg.sender);
    }

// Usinng struct to store. A struct is basically a custom datatype where we can customize what we want to hold inside it.
    struct Coffee{
        address sender; //The address of user who want to send me coffee
        string message; //The message he want to attach
        uint256 timestamp; //Time transaction took place
        string name; //Name of the buyer
    }

//storing array of struct Coffee
  Coffee[] coffee;

//return struct array coffee
  function getAllCoffee() public view returns(Coffee[] memory){
      return coffee;
  }

//return total coffee bought
 function getTotalCoffee() public view returns(uint256){
     return totalCoffee;
 }

 function buyCoffee(string memory _message, string memory _name, uint256 _amount) public payable{
   uint256 cost = 0.001 ether;
   require(_amount>=cost,"Not enough fund payed");
   totalCoffee = totalCoffee + 1;
   coffee.push(Coffee(msg.sender,_message,block.timestamp,_name));
   (bool success,)= owner.call{value: _amount}(""); //sending ether
   require(success,"Transaction Failed");
   emit NewCoffee(msg.sender,_message,block.timestamp,_name);
 }
}