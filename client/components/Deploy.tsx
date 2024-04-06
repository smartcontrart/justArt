import { useState } from "react";
import {
  useConnect,
  useWalletClient,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useAccount } from "wagmi";
import Wuzzles from "../contracts/Wuzzles.sol/Wuzzles.json";

export default function Deploy() {
  const contractAbi = Wuzzles.abi; // ... Your contract ABI
  const contractBytecode = Wuzzles.bytecode; // ... Your contract bytecode
  const { address, connector, isConnected } = useAccount();
  const [userConnected, setUserConnected] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [alert, setAlert] = useState({
    active: false,
    content: null,
    variant: null,
  });

  async function onSubmit() {
    const hash = await walletClient?.deployContract({
      abi: Wuzzles.abi,
      bytecode: Wuzzles.bytecode as `0x${string}`,
      args: ["https://arweave.net/z0Z0w8Qwssb1Dh0vOrkhr5WkFhoOtCqcE8_MVNVH3zk"],
    });
  }

  return (
    <div className="grid justify-items-center">
      <h1 className="text-9xl text-center">Welcome Wuzzlers </h1>
      <h2 className="text-l text-center m-10">
        Ready to deploy? Click the button....
      </h2>
      <button
        className="border-solid border-2 p-2"
        width="500"
        onClick={() => onSubmit()}
      >
        Deploy
      </button>
    </div>
  );
}
