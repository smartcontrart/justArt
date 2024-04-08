import { useState } from "react";
import {
  useConnect,
  useWalletClient,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useAccount } from "wagmi";
import JustArt from "../contracts/JustArt.sol/JustArt.json";

export default function Deploy() {
  const contractAbi = JustArt.abi; // ... Your contract ABI
  const contractBytecode = JustArt.bytecode; // ... Your contract bytecode
  const { address, connector, isConnected } = useAccount();
  const [userConnected, setUserConnected] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [alert, setAlert] = useState({
    active: false,
    content: null,
    variant: null,
  });

  const DEFAULT_URI_DATA_PHASE_0 = {
    name: "JustArt* #",
    description:
      "after a while the meaning of a given work is valued by the price people are willing to pay.",
    image: "https://arweave.net/TiRpt56pd7hAEn8Aa9HHJnSi9iZBpvvidzrTWwZAfow",
  };
  const DEFAULT_URI_DATA_PHASE_1 = {
    name: "JustArt* #",
    description:
      "after a while the meaning of a given work is valued by the price people are willing to pay.",
    image: "https://arweave.net/1LxpZB7jljZDADFAcEmN-CDDck6VfbdAGrv8keTAGaI/",
  };
  const DEFAULT_URI_DATA_PHASE_2 = {
    name: "Untitled #",
    description:
      "after a while the meaning of a given work is valued by the price people are willing to pay.",
    image: "https://arweave.net/YeHJekpGktwjGx_7nzRdfd0jmGQh3Vr58p9ZTKmGyU4/",
  };
  const DEFAULT_URI_DATA_RECEIPT = {
    name: "Receipt #",
    description:
      "after a while the meaning of a given work is valued by the price people are willing to pay.",
    image: "https://arweave.net/QmuMaGnuvvCxyHlsq2rXQ0iYlGtNJDue21m4U8dAKFo/",
  };

  async function onSubmit() {
    const hash = await walletClient?.deployContract({
      abi: JustArt.abi,
      bytecode: JustArt.bytecode as `0x${string}`,
      args: [
        DEFAULT_URI_DATA_PHASE_0,
        DEFAULT_URI_DATA_PHASE_1,
        DEFAULT_URI_DATA_PHASE_2,
        DEFAULT_URI_DATA_RECEIPT,
      ],
    });
  }

  return (
    <div className="grid justify-items-center">
      <h1 className="text-9xl text-center">Welcome Myles</h1>
      <h2 className="text-l text-center m-10">
        Ready to create ... Just Art*? Click the button....
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
