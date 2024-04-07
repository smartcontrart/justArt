import { useState, useContext, useEffect } from "react";
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import JustArtMint from "../contracts/JustArtMint.sol/JustArtMint.json";

export default function PublicMint(props) {
  const { chain, chains } = useNetwork();
  const { address, isConnected } = useAccount();
  const [chainId, setChainId] = useState(0);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    setQuantity(isNaN(props.quantity) ? 0 : props.quantity);
    console.log(quantity);
    setChainId(chain!.id);
  }, [chain, address, isConnected, props.quantity]);

  const { data: pdata, config } = usePrepareContractWrite({
    address:
      chain!.id === 11155111
        ? (process.env.NEXT_PUBLIC_JUSTART_MINT_SEPOLIA as `0x${string}`)
        : (process.env.NEXT_PUBLIC_JUSTART_MINT as `0x${string}`),
    abi: JustArtMint.abi,
    functionName: "publicMint",
    args: [quantity],
    value: BigInt(props.price) * BigInt(quantity),
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
          className="text-xl color-change rounded-3xl px-4  disabled:opacity-20"
          onClick={() => write!()}
        >
          mint.
        </button>
      ) : null}
    </span>
  );
}
