import { useState, useContext, useEffect } from "react";
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import JustArtMint from "../contracts/JustArtMint.sol/JustArtMint.json";
import signedList from "../signedList.json";

export default function PrivateMint(props) {
  const [signedMessage, setSignedMessage] = useState({ v: "", r: "", s: "" });
  const { address, connector, isConnected } = useAccount();
  const { chain, chains } = useNetwork();
  const [quantity, setQuantity] = useState(
    isNaN(props.quantity) ? 0 : props.quantity
  );

  useEffect(() => {
    const findSignedMessage = async (account: any) => {
      let signedMessage = { v: "", r: "", s: "" };
      for (let i = 0; i < signedList.length; i++) {
        let key = Object.keys(signedList[i])[0];
        if (key.toLowerCase() === address.toLowerCase()) {
          signedMessage = signedList[i][key];
        }
      }

      setSignedMessage(signedMessage);
    };
    console.log(quantity);
    findSignedMessage(address);
    setQuantity(isNaN(props.quantity) ? 0 : props.quantity);
  }, [signedMessage, address, isConnected, props]);

  const { config } = usePrepareContractWrite({
    address:
      chain!.id === 11155111
        ? (process.env.NEXT_PUBLIC_JUSTART_MINT_SEPOLIA as `0x${string}`)
        : (process.env.NEXT_PUBLIC_JUSTART_MINT as `0x${string}`),
    abi: JustArtMint.abi,
    functionName: "privateMint",
    args: [quantity, signedMessage.v, signedMessage.r, signedMessage.s],
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
