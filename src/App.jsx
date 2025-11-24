import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import CrossChainSendForm from "./components/CrossChainSendForm";

function App() {
  const [account, setAccount] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <ConnectWallet account={account} onConnect={connectWallet} onDisconnect={handleDisconnect}/>

      {account && <CrossChainSendForm account={account} />}
    </div>
  );
}

export default App;
