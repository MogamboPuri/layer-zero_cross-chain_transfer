// Minimal mapping: chainId -> { srcEid, contract }
export const chainConfig = {
    97: {            
      label: "BSC",            // BNB Testnet
      srcEid: 40102,
      contract: "0xa5Ac79e50021eB87F0fD5DA22fF48De68bce01A9",
      explorer: "https://testnet.bscscan.com/tx/"
    },
  
    80002: {                    // Polygon Amoy
      label: "Polygon Amoy",
      srcEid: 40267,
      contract: "0xf7032caEF9E236F83e4e508d8Fd7Cb7c0ea16573",
      explorer: "https://www.oklink.com/amoy/tx/"
    },
  
    11155111: {                 // Sepolia
      label: "Sepolia",
      srcEid: 40161,
      contract: "0xF9D0d4d1f8e7258Bb2Fd535C4c15831Cc1E2E0e0",
      explorer: "https://sepolia.etherscan.io/tx/"
    },


  // ✅ ADD SOLANA
  1399811149: {
    label: "Solana Testnet",
    srcEid: 40168,         
    contract: "7LUkhAyMcu74t1qvAgxTnMhHeCQT4JzBqY4egquTT35h",
    explorer: "https://solscan.io/tx/"
  },
  };
  
  // helper
  export function getChainConfig(chainId) {
    return chainConfig[chainId] || null;
  }
  