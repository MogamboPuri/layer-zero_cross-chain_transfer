import { useState, useEffect } from "react";
import ConnectWallet from "./components/ConnectWallet";
import CrossChainSendForm from "./components/CrossChainSendForm";


function App() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

      // Detect chain + account listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const loadInitial = async () => {
      // get current chain
      const id = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(id, 16));

      // get current account
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      setAccount(accounts[0] || null);
    };

    loadInitial();

    const handleChainChanged = async (id) => {
      setChainId(parseInt(id, 16));

      // ✅ refresh accounts to stay connected
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      setAccount(accounts[0] || null);
    };

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
    };

    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {

    if (!window.ethereum) return alert("MetaMask not found");

    try{
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
  
      setAccount(accounts[0]);
    }catch (err) {
      console.log("User rejected connection");
    }
  };

  const handleDisconnect = () => {
    // ✅ Just clear UI state — MetaMask does NOT support programmatic disconnect
    setAccount(null);
  };

  // ✅ switch MetaMask network
  const switchNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + Number(targetChainId).toString(16) }],
      });

      // ✅ refresh accounts (keeps UI connected)
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      setAccount(accounts[0] || null);

      setChainId(Number(targetChainId));
    } catch (err) {
      if (err.code === 4902) {
        alert("Network not added in MetaMask");
      }
      console.log("Network switch error:", err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <ConnectWallet account={account} onConnect={connectWallet} chainId={chainId}
      onDisconnect={handleDisconnect} onSwitchNetwork={switchNetwork}/>

      {account && <CrossChainSendForm account={account} chainId={chainId}/>}
    </div>
  );
}

export default App;
