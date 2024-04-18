import { useState, useEffect } from "react";
import Image from "next/image";
import justArt from "../visuals/justart_.svg";
import { use } from "chai";
import JustArt from "../contracts/JustArt.sol/JustArt.json";
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

export default function BurnableItems(props) {
  const { address, connector, isConnected } = useAccount();
  const { chain, chains } = useNetwork();
  const [nfts, setNfts] = useState([]);
  const [selection, setSelection] = useState([]);

  useEffect(() => {
    setNfts(props.nfts);
  }, [props.nfts]);

  const renderOptions = () => {
    return nfts.map((nft, index) => {
      return (
        <span
          key={index}
          onClick={() => {
            if (selection.includes(nft.tokenId)) {
              setSelection(selection.filter((id) => id != nft.tokenId));
            } else {
              setSelection([...selection, nft.tokenId]);
            }
          }}
        >
          <Image
            className={`${
              selection.includes(nft.tokenId) ? "border-black border-2" : ""
            } w-1/3 m-2 text-center rounded-md cursor-pointer h-20 w-20`}
            src={nft.image.cachedUrl}
            alt="nft_visual"
            width={100}
            height={150}
          />
        </span>
      );
    });
  };

  const { config } = usePrepareContractWrite({
    address: chain
      ? chain!.id === 11155111
        ? (process.env.NEXT_PUBLIC_JUSTART_SEPOLIA as `0x${string}`)
        : (process.env.NEXT_PUBLIC_JUSTART as `0x${string}`)
      : "",
    abi: JustArt.abi,
    functionName: "swap",
    args: [selection],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div className="flex flex-col justify-center items-center lg:w-1/3 items-start pt-20">
      <Image src={justArt} className="flex w-72 max-w-52" alt="barcode" />
      <div className="flex flex-wrap grid-cols-3 lg:h-96 w-100 overflow-scroll my-5 h-128">
        {renderOptions()}
      </div>
      <button
        disabled={selection.length % 4 !== 0 || write === undefined}
        onClick={() => write()}
        className="rounded-xl pink text-xl w-24 m-5 disabled:opacity-20"
      >
        Burn
      </button>
      <div className="min-w-100 text-blue-600 text-sm">
        YOU HAVE {nfts.length} BURNABLE TOKENS - BURN IN MULTIPLES OF (4)
      </div>
    </div>
  );
}
