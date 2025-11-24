import React, { useState, useEffect } from "react";
import Web3 from "web3";
import bs58 from "bs58";

import oftArtifact from "../abi/OFT.json";
import { addressToBytes32 } from "../utils/layerzero";
import { chainConfig, getChainConfig } from "../config/chainConfig";


const ABI = oftArtifact.abi;
const SOLANA_EID = 40168;

// Recipient conversion
function toBytes32HexForDest(toAddress, destEid) {
  if (Number(destEid) === Number(SOLANA_EID)) {
    console.log("Converting Solana address to bytes32 hex");
    try {
      const bytes = bs58.decode(toAddress);
      console.log("Decoded bytes:", bytes.length);
      if (bytes.length !== 32) {
        throw new Error("Solana address must decode to 32 bytes");
      }
    // ✅ convert Uint8Array → hex without Buffer
     const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")) .join("");

     return "0x" + hex;   
     } catch (e) {
      console.log("Invalid Solana base58 address: " + e.message)
      throw new Error("Invalid Solana base58 address: " + e.message);
    }
  }

  // normal EVM
  return addressToBytes32(toAddress);
}

const CrossChainSendForm = ({ account }) => {

  const [chainId, setChainId] = useState(null);
  const [config, setConfig] = useState(null);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [destEid, setDestEid] = useState("");

  const [status, setStatus] = useState("");

  // Detect chain
  useEffect(() => {
    const detectChain = async () => {
      if (!window.ethereum) return;

      const id = await window.ethereum.request({ method: "eth_chainId" });
      console.log("Detected chainId (hex):", id);
      const parsed = parseInt(id, 16);
      console.log("Detected chainId (dec):", parsed);
      setChainId(parsed);

      const conf = getChainConfig(parsed);
      setConfig(conf);
    };

    detectChain();

    window.ethereum?.on("chainChanged", () => {
      window.location.reload();
    });
  }, []);

  // --- helper for dropdown ---
const getDestinationChains = (currentChainId) => {
  return Object.entries(chainConfig)
    .filter(([id]) => Number(id) !== Number(currentChainId))
    .map(([id, cfg]) => ({
      chainId: Number(id),
      label: cfg.label,
      destEid: cfg.srcEid,
    }));
};

  const handleSend = async () => {
    try {

      if (!config) {
        setStatus("Unsupported network");
        return;
      }

      if (!destEid) {
        setStatus("Select destination EID");
        return;
      }

      setStatus("Preparing...");

      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(ABI, config.contract);

      // 1. fetching decimals
      console.log("Fetching decimals------>");
      const decimals = Number(await contract.methods.decimals().call());
      console.log("decimals:", decimals);

      // 2. fetching balance
      console.log("Fetch balance------>");
      const raw = await contract.methods.balanceOf(account).call();
      const balance = Number(raw) / 10 ** decimals;
      console.log("Balance:", balance);


    //3. CONVERT AMOUNT INPUT
    const amountLD = BigInt(
      Math.floor(Number(amount) * 10 ** decimals)
    );
    console.log("Amount:", String(amountLD));

    const balanceLD = BigInt(raw);

    //BALANCE CHECK
    if (amountLD > balanceLD) {
     setStatus("Insufficient balance for this transfer");
     return;
    }
    
    //  4. convert recipient address to bytes32
      let toBytes32;
      try {
        console.log("Converting recipient address:", to);
        toBytes32 = toBytes32HexForDest(to, destEid);
      } catch (err) {
        setStatus("Recipient error: " + err.message);
        return;
      }
  
    // 5. build send params
      const sendParam = {
        dstEid: destEid,
        to: toBytes32,
        amountLD: amountLD.toString(),
        minAmountLD:  amountLD.toString(),
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
      };

      console.log("Send params:", sendParam);


      // // 6. Approve
      // await contract.methods.approve(CONTRACT, amountLD).send({ from: account });
      // setStatus("Approval done...");
  
      // 7. Quote fee
      setStatus("Quoting fee...");
      const fee = await contract.methods.quoteSend(sendParam, false).call({ from: account });
      console.log("Quoted fee:", fee);

      // 7. Estimate gas limit
    // setStatus("Estimating gas...");

    // const estimatedGas = await contract.methods
    //   .send(sendParam, fee, account)
    //   .estimateGas({
    //     from: account,
    //     value: fee.nativeFee,
    //   });

    // console.log("Estimated gas:", estimatedGas);

    // // ✅ add buffer (20%)
    // const gasLimit = Math.floor(estimatedGas * 1.2);

    // // ✅ boost gas price (fixes JSON-RPC underpriced errors)
    // const gasPrice = await web3.eth.getGasPrice();
    // const boostedGas = (BigInt(gasPrice) * 2n).toString(); // 2x gas

    // console.log("Boosted gas price:", boostedGas);
  
      setStatus("Sending...");
  
      const tx = await contract.methods
        .send( sendParam, fee, account).send({ from: account,value: fee.nativeFee });

      console.log("Transaction sent:", tx);
  
      const cfg = chainConfig[Number(chainId)];
      console.log("Current Explorer Base URL:", cfg);
      console.log("Explorer URL:", cfg.explorer , tx.transactionHash);

      setStatus(
        <a
          href={`${cfg.explorer}${tx.transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          SUCCESS! View Transaction
        </a>
      );

    } catch (err) {
      console.error(err);
      setStatus(`Failed: ${err.message.substring(0, 150)}`);
    }
  };

  if (!config)
    return (
      <div className="p-4 text-red-600">
        Unsupported chain. Switch to BNB Testnet / Amoy / Sepolia.
      </div>
    );

  return (
    
    <div className="p-4 max-w-md mx-auto border rounded mt-6">

        {/* DESTINATION DROPDOWN */}
    <div className="mt-3">
    <label>Destination Chain</label>
    <select className="border w-full p-2 rounded"value={destEid}
    onChange={(e) => setDestEid(e.target.value)}>
    <option value="">Select destination</option>
    {getDestinationChains(chainId).map((chain) => (
      <option key={chain.chainId} value={chain.destEid}>
        {chain.label}
      </option>
    ))}
    </select>
     </div>

      <div className="mt-3">
        <label>Recipient</label>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border w-full p-2 rounded"
        />
      </div>

      <div className="mt-3">
        <label>Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border w-full p-2 rounded"
        />
      </div>

      <button
        onClick={handleSend}
        className="mt-4 w-full bg-green-600 text-white p-2 rounded"
      >
        Send
      </button>

      <p className="mt-4 text-sm text-gray-700">{status}</p>
    </div>
  );
};

export default CrossChainSendForm;
