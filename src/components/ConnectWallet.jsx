import React from "react";

const ConnectWallet = ({ account, onConnect, onDisconnect }) => {
  return (
    <div className="w-full flex justify-end gap-3 p-4 border-b">

      {!account ? (
        <button
          onClick={onConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect
        </button>
      ) : (
        <>
          <button
            className="px-4 py-2 bg-gray-200 text-black rounded"
          >
            {account.slice(0, 6) + "..." + account.slice(-4)}
          </button>

          <button
            onClick={onDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Disconnect
          </button>
        </>
      )}
    </div>
  );
};

export default ConnectWallet;
