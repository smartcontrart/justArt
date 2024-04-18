import BurnableItems from "./BurnableItems";
import RedeemableItems from "./RedeemableItems";
import Image from "next/image";
import instructions from "../visuals/instructions.svg";
import { useState, useEffect } from "react";

export default function RedeemInterface(props: any) {
  const originalNFTs: any = [];
  const redeemedNFTs: any = [];

  useEffect(() => {
    console.log(props.nfts);
    props.nfts.forEach((nft: any) => {
      if (parseInt(nft.tokenId) < 12000) {
        originalNFTs.push(nft);
      } else {
        console.log(nft);
        redeemedNFTs.push(nft);
      }
    });
  }, [props.nfts]);

  return (
    <div className="flex flex-col lg:flex-row justify-between p-5">
      <BurnableItems nfts={originalNFTs} />
      <Image
        src={instructions}
        alt="instructions"
        className="my-14 self-center"
      />
      <RedeemableItems nfts={redeemedNFTs} />
    </div>
  );
}
