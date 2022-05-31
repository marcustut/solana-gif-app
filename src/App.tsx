import { useCallback, useEffect, useState } from "react";

import "./App.css";
import { connectWallet, getProvider, PhantomProvider } from "./lib/phantom";

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

// Constants
const TWITTER_HANDLE = "geminimarcus";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [provider, setProvider] = useState<PhantomProvider>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [inputValue, setInputValue] = useState<string>("");
  const [gifList, setGifList] = useState<string[]>([]);

  useEffect(() => setProvider(getProvider()), []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");

      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

  const handleConnectWallet = useCallback(async () => {
    if (!provider) {
      console.error("no provider found");
      return;
    }
    setWalletAddress(await connectWallet(provider));
  }, [provider]);

  const sendGif = useCallback(async () => {
    if (inputValue.length > 0) {
      console.log("Gif link:", inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue("");
    } else {
      console.log("Empty input. Try again.");
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
        {gifList.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        {provider ? (
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
