import { useCallback, useEffect, useState } from "react";
import { web3 } from "@project-serum/anchor";

import "./App.css";
import {
  connectWallet,
  getAnchorProvider,
  getPhantomProvider,
  getProgram,
  PhantomProvider,
} from "./lib/solana";
import keyPair from "../keypair.json";
import { PublicKey } from "@solana/web3.js";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Retrieve the baseAccount keypair
const arr = Object.values(keyPair._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Constants
const TWITTER_HANDLE = "geminimarcus";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

type GIF = {
  gifLink: string;
  userAddress: PublicKey;
};

const App = () => {
  const [phantomProvider, setPhantomProvider] = useState<PhantomProvider>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [inputValue, setInputValue] = useState<string>("");
  const [gifList, setGifList] = useState<GIF[] | null>(null);

  const getGifList = useCallback(async () => {
    try {
      const program = getProgram();
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  }, [setGifList]);

  const createGifAccount = async () => {
    try {
      const provider = getAnchorProvider();
      const program = getProgram();
      console.log("ping");
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.error("Error creating BaseAccount account:", error);
    }
  };

  useEffect(() => setPhantomProvider(getPhantomProvider()), []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      getGifList();
    }
  }, [walletAddress]);

  const handleConnectWallet = useCallback(async () => {
    if (!phantomProvider) {
      console.error("no provider found");
      return;
    }
    setWalletAddress(await connectWallet(phantomProvider));
  }, [phantomProvider]);

  const sendGif = useCallback(async () => {
    if (inputValue.length === 0) {
      alert("No gif link given!");
      return;
    }
    setInputValue("");
    console.log("Gif link:", inputValue);
    try {
      const provider = getAnchorProvider();
      const program = getProgram();
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue);
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  }, [inputValue]);

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={handleConnectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      {gifList === null ? (
        <button
          className="cta-button submit-gif-button"
          onClick={createGifAccount}
        >
          Do One-Time Initialization For GIF Program Account
        </button>
      ) : (
        <>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input
              type="text"
              placeholder="Enter gif link!"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Submit
            </button>
          </form>
          <div className="gif-grid">
            {gifList.map((gif, idx) => (
              <div className="gif-item" key={idx}>
                <img src={gif.gifLink} alt={gif.gifLink} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        {phantomProvider ? (
          <div className={walletAddress ? "authed-container" : "container"}>
            <div className="header-container">
              <p className="header">🖼 GIF Portal</p>
              <p className="sub-text">
                View your GIF collection in the metaverse ✨
              </p>
            </div>
            {!walletAddress
              ? renderNotConnectedContainer()
              : renderConnectedContainer()}
            <div className="footer-container">
              <img
                alt="Twitter Logo"
                className="twitter-logo"
                src="/assets/twitter-logo.svg"
              />
              <a
                className="footer-text"
                href={TWITTER_LINK}
                target="_blank"
                rel="noreferrer"
              >{`built on @${TWITTER_HANDLE}`}</a>
            </div>
          </div>
        ) : (
          <>
            <p className="header">No provider found. Install it first</p>
            <a className="footer-text" href="https://phantom.app/">
              Phantom Browser extension
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
