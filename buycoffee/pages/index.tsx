
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import abi from "../utils/CoffeePortal.json";

declare var window: any

export default function Home() {

  const contractAddress = "0xA5b719159cAb5bdB066DBE7d3D9820Bfa875119D";

  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");

  const [message, setMessage] = useState("");

  const [name, setName] = useState("");

  const [allCoffee, setAllCoffee] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;


      // Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success("🦄 Wallet is Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  //connectWallet 
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await coffeePortalContract.getTotalCoffee();
        console.log("Retrieved total coffee count...", count.toNumber());

        const coffeeTxn = await coffeePortalContract.buyCoffee(
          message ? message : "Enjoy Your Coffee",
          name ? name : "Anonymous",
          ethers.utils.parseEther("0.001"),
          {
            gasLimit: 300000,
          }
        );
        console.log("Mining...", coffeeTxn.hash);

        toast.info("Sending Fund for coffee...", {
          position: "top-left",
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await coffeeTxn.wait();

        console.log("Mined -- ", coffeeTxn.hash);

        count = await coffeePortalContract.getTotalCoffee();

        console.log("Retrieved total coffee count...", count.toNumber());

        setMessage("");
        setName("");

        toast.success("Coffee Purchased!", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };


   //method that gets all coffee from our contract
  
  const getAllCoffee = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        
         //Calling the getAllCoffee method from Smart Contract
         
        const coffees = await coffeePortalContract.getAllCoffee();

        /*
         * We only need address, timestamp, name, and message in our UI so let's
         * pick those out
         */
        const coffeeCleaned = coffees.map((coffee) => {
          return {
            address: coffee.sender,
            timestamp: new Date(coffee.timestamp * 1000),
            message: coffee.message,
            name: coffee.name,
          };
        });

        
        //Store our data in React State 
        setAllCoffee(coffeeCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  
   //This runs our function when the page loads.
 
  useEffect(() => {
    let coffeePortalContract;
    getAllCoffee();
    checkIfWalletIsConnected();

    const onNewCoffee = (from, message, timestamp, name) => {
      console.log("NewCoffee", from, message, timestamp, name);
      setAllCoffee((prevState) => [
        ...prevState,
        {
          address: from,
          message: message,
          timestamp: new Date(timestamp * 1000),
          name: name,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      coffeePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      coffeePortalContract.on("NewCoffee", onNewCoffee);
    }

    return () => {
      if (coffeePortalContract) {
        coffeePortalContract.off("NewCoffee", onNewCoffee);
      }
    };
  }, []);

  const handleOnMessageChange = (event) => {
    const { value } = event.target;
    setMessage(value);
  };
  const handleOnNameChange = (event) => {
    const { value } = event.target;
    setName(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-sky-100">
      <Head>
        <title>CoffeeTime</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
      
        {/*
         * If there is currentAccount render this form, else render a button to connect wallet
         */}

        {currentAccount ? (
          <div>
            <h1 className="text-6xl font-bold font-mono text-slate-700 mb-6">
              buy me a coffee
            </h1>
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Name"
                  onChange={handleOnNameChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Send the Creator a Message
                </label>

                <textarea
                  className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Message"
                  id="message"
                  onChange={handleOnMessageChange}
                  required
                ></textarea>
              </div>

              <div className="flex items-left justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={buyCoffee}
                >
                  Support $5
                </button>
              </div>
            </form>
          </div>
        </div>
        ) : (
          <div>
          <img
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.phi_9sEC8l3AzEiOz-cGdwHaHa%26pid%3DApi&f=1"
            class="w-85 h-85 rounded-full"
            alt="coffee img"
          />
        <h1 className="text-6xl font-bold font-mono text-slate-700 mb-6">
          buy me a coffee
        </h1>
          <button
            className="bg-black hover:bg-white text-white hover:text-amber-700 font-bold font-mono py-2 px-3 rounded-full mt-2"
            onClick={connectWallet}
          >
            Connect Your Wallet
          </button>
          </div>
        )}

        {allCoffee.map((coffee, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Dot Following the Left Vertical Line --> */}
                <div className="w-5 h-5 bg-blue-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

                {/* <!-- Line that connecting the box with the vertical line --> */}
                <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>

                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">Supporter: {coffee.name}</h1>
                  <h1 className="text-md">Message: {coffee.message}</h1>
                  <h3>Address: {coffee.address}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {coffee.timestamp.toString()}
                  </h1>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}