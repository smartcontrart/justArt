import { useState, useEffect } from "react";
import Image from "next/image";
import untitled from "../visuals/untitled.svg";
import { use } from "chai";

export default function RedeemableItems(props) {
  const [nfts, setNfts] = useState([]);
  const [selection, setSelection] = useState([]);

  useEffect(() => {
    console.log(props);
    setNfts(props.nfts);
  }, [props.nfts]);

  const renderOptions = () => {
    return nfts.map((nft, index) => {
      return (
        <span key={index}>
          <Image
            className={`${
              selection.includes(nft) ? "border-black border-2" : ""
            } w-1/3 m-2 text-center rounded-md h-20 w-20`}
            src={nft.image.cachedUrl}
            alt="nft_visual"
            width={100}
            height={150}
          />
        </span>
      );
    });
  };
  return (
    <div className="flex flex-col justify-center items-center lg:w-1/3 items-start">
      <Image src={untitled} className="flex w-72 max-w-52" alt="barcode" />
      <div className="flex flex-wrap grid-cols-3 lg:h-96 w-100 overflow-scroll my-5 h-128">
        {renderOptions()}
      </div>
      <div className="h-24"></div>
    </div>
  );
}
