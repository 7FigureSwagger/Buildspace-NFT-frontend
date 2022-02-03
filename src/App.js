import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import ehrabNFT from './utils/EhrabNFT.json';

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const App = () => {
	// Hold selected MetaMask account in state
	const [currentAccount, setCurrentAccount] = useState("");

	// Make sure we have access to window.ethereum
	const checkMetaMaskConnect = async () => {
		// Desconstruct window, and pull ethereum
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Please install MetaMask");
		} else {
			console.log("Ethereum found...", ethereum);
		}

		// Check for users accounts
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// There can be multiple accounts, we want to grab the first one there
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account: ", account);
			setCurrentAccount(account);

			// Set up listener, for case where user already had their wallet connected + authorized
			setupEventListener()
		} else {
			console.log("No authorized account found");
		}
	};

	// Wallet connect method
	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Please install MetaMask!");
				return;
			}
			// Request account access
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });
			
			// Print account address once MetaMask is authorized
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);

			// Set listener, in case where user is connecting wallet for first time
			setupEventListener()
		} catch (error) {
			console.log(error);
		}
	}

	// Function for NFT mint
	const askContractToMintNft = async () => {	
		try {
			const { ethereum } = window;
	
			if (ethereum) {
				// Provider is what we use to actually talk to Ethereum nodes
				// MetaMask provides nodes in the background
				const provider = new ethers.providers.Web3Provider(ethereum);

				// Signer is an abstraction of an ethereum account, which can be used to sign transactions and messages
				const signer = provider.getSigner();

				// Create the connection to our contract
				const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, ehrabNFT.abi, signer);
	
				// Call the mint function in contract
				console.log("Going to pop wallet now to pay gas...")
				let nftTxn = await connectedContract.mintEhrabNFT();
				
				// Wait for transaction to be mined...
				console.log("Mining...please wait.")
				await nftTxn.wait();
				
				console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
	
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error)
		}
	}

	// Setup our listener
	const setupEventListener = async () => {
		// Much of this is the same as function askContractToMintNft
		try {
			const { ethereum } = window;
	
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, ehrabNFT.abi, signer);
	
				// Capture event when thrown by contract
				// Very similar to webhooks
				connectedContract.on("NewNFTMinted", (from, tokenId) => {
					// Returned params from contract event (from, tokenId)
					console.log(from, tokenId.toNumber());
					alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
				})

				console.log("Event listener set!")
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error)
		}

	}


	// Render Methods
	const renderNotConnectedContainer = () => (
		<button onClick={connectWallet} className="cta-button connect-wallet-button">
			Connect to Wallet
		</button>
	);

	useEffect(() => {
		checkMetaMaskConnect();
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">My NFT Collection</p>
					<p className="sub-text">
						Each unique. Each beautiful. Discover your NFT today.
					</p>
					{currentAccount === ""
						? renderNotConnectedContainer()
						: (
							<button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
								Mint NFT
							</button>
						)
					}
				</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
