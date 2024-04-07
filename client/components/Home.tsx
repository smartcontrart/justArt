import { useState, useContext, useEffect } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../visuals/Logo.svg";
import barcode from "../visuals/barcode.svg";
import UserInterface from "./UserInterface";
import WuzzlesMint from "../contracts/WuzzlesMint.sol/WuzzlesMint.json";
import { useAccount, useBalance, useNetwork, readContracts } from "wagmi";

export default function Home() {
  const { address, connector, isConnected } = useAccount();
  const [userConnected, setUserConnected] = useState(false);
  const { chain, chains } = useNetwork();

  useEffect(() => {
    setUserConnected(isConnected);
  }, [isConnected, chain, userConnected]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {userConnected ? (
        <div className="flex flex-col md:flex-row md:justify-between p-5 items-start">
          {isConnected ? <UserInterface /> : null}
          <span className="self-center md:self-start m-3">
            <ConnectButton chainStatus="icon" showBalance={false} />
          </span>
        </div>
      ) : (
        <div className="flex self-center md:self-end justify-end p-5">
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      )}

      <div className="min-h-100">
        <div className="flex">
          <div className="m-auto">
            <Image
              src={logo}
              className="w-auto"
              alt="logo"
              // style={{ maxHeight: "100%" }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col text-4xl p-5 font-extrabold justify-end">
        <div className="flex flex-col md:flex-row text-xs lg:text-lg font-extrabold self-end w-1/4 justify-between text-center self-center lg:self-end ">
          <div>.005 eth</div>
          <div>0/12,000 minted.</div>
        </div>
        <div className="flex text-lg font-extrabold lg:justify-end justify-center">
          <Image
            src={barcode}
            className="flex NFT_visual"
            alt="barcode"
            style={{ width: "25%" }}
          />
        </div>
      </div>
    </div>
  );
}
