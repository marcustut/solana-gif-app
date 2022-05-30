import { useCallback, useEffect, useState } from "react";

import "./App.css";
import { connectWallet, getProvider, PhantomProvider } from "./lib/phantom";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [provider, setProvider] = useState<PhantomProvider>();
  const [walletAddress, setWalletAddress] = useState<string>();

  useEffect(() => {
    setProvider(getProvider());
  }, []);

  const handleConnectWallet = useCallback(async () => {
    if (!provider) {
      console.error("no provider found");
      return;
    }
    setWalletAddress(await connectWallet(provider));
  }, [provider]);

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={handleConnectWallet}
    >
      Connect to Wallet
    </button>
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
            {!walletAddress && renderNotConnectedContainer()}
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
