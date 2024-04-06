import { useState, useContext, useEffect } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../visuals/Logo.png";
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
              className="NFT_visual"
              alt="logo"
              style={{ maxHeight: "100%" }}
            />
          </div>
        </div>
      </div>

      <div className="text-4xl p-5 font-extrabold">wuzzles.</div>
    </div>
  );
}
