import { useState, useContext, useEffect } from "react";
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import WuzzlesMint from "../contracts/WuzzlesMint.sol/WuzzlesMint.json";

export default function PublicMint() {
  const [alert, setAlert] = useState({ display: false, message: "" });
  const { chain, chains } = useNetwork();
  const { address, isConnected } = useAccount();
  const [chainId, setChainId] = useState(0);

  useEffect(() => {
    setChainId(chain!.id);
  }, [chain, address, isConnected]);

  const { data: pdata, config } = usePrepareContractWrite({
    address:
      chain!.id === 11155111
        ? (process.env.NEXT_PUBLIC_WUZZLES_MINT_SEPOLIA as `0x${string}`)
        : (process.env.NEXT_PUBLIC_WUZZLES_MINT as `0x${string}`),
    abi: WuzzlesMint.abi,
    functionName: "publicMint",
    value: BigInt(9 * 10 ** 15),
  });

  const { data, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <span className="grid align-center">
      {!isLoading ? (
        <button
          disabled={!write}
          className="w-80 bg-neutral-200 rounded mt-5 mb-2 text-xl disabled:opacity-20"
          onClick={() => write!()}
        >
          mint.
        </button>
      ) : null}
    </span>
  );
}
