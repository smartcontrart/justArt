import { useState, useContext, useEffect, useRef } from "react";
// import { Suspense } from "react";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import barcode from "../visuals/barcode.svg";
import RedeemInterface from "./RedeemInterface";
import JustArt from "../contracts/JustArt.sol/JustArt.json";
import { Network, Alchemy } from "alchemy-sdk";
import { useAccount, useNetwork } from "wagmi";

export default function Redeem() {
  const { address, connector, isConnected } = useAccount();
  const [userConnected, setUserConnected] = useState(false);
  const { chain, chains } = useNetwork();
  const [supply, setSupply] = useState(0);
  const [nfts, setNfts] = useState([]);
  //   const tokenSelection = useRef([]);
  //   const [tokenSelection, setTokenSelection] = useState([]);
  //   let tokenSelection: [] = [];

  useEffect(() => {
    setUserConnected(isConnected);

    const getNFTs = async () => {
      const config = {
        apiKey: process.env.REACT_APP_ALCHEMY_KEY,
        network:
          chain!.id === 11155111 ? Network.ETH_SEPOLIA : Network.ETH_BASE,
      };
      const alchemy = new Alchemy(config);

      const contractAddress =
        chain!.id === 11155111
          ? process.env.NEXT_PUBLIC_JUSTART_SEPOLIA
          : process.env.NEXT_PUBLIC_JUSTART;

      const response = await alchemy.nft.getNftsForOwner(
        address as `0x${string}`,
        {
          contractAddresses: [`${contractAddress}`],
          pageSize: 100,
        }
      );
      setNfts(response.ownedNfts);
    };
    {
      isConnected ? getNFTs() : null;
    }
  }, [address, isConnected]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {userConnected ? (
        <div className="flex flex-col md:flex-row md:justify-between p-5 items-start">
          {isConnected ? (
            chain!.id === 11155111 ? (
              <div></div>
            ) : (
              <div>Please connect to Base</div>
            )
          ) : null}
          <span className="self-center md:self-start m-3">
            <ConnectButton chainStatus="icon" showBalance={false} />
          </span>
        </div>
      ) : (
        <div className="flex self-center md:self-end justify-end p-5">
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      )}

      <div className="justify-center bg-white rounded-2xl mx-5">
        <RedeemInterface nfts={nfts} />
      </div>

      <div className="flex flex-col text-4xl p-5 font-extrabold justify-end">
        <div className="flex text-lg font-extrabold lg:justify-end justify-center">
          <Image src={barcode} className="flex w-72 md:w-96" alt="barcode" />
        </div>
      </div>
    </div>
  );
}
