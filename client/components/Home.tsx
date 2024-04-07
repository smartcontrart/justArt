import { useState, useContext, useEffect } from "react";
// import { Suspense } from "react";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../visuals/Logo.svg";
import barcode from "../visuals/barcode.svg";
import UserInterface from "./UserInterface";
import JustArt from "../contracts/JustArt.sol/JustArt.json";
import { useAccount, useBalance, useNetwork, readContracts } from "wagmi";

export default function Home() {
  const { address, connector, isConnected } = useAccount();
  const [userConnected, setUserConnected] = useState(false);
  const { chain, chains } = useNetwork();
  const [supply, setSupply] = useState(0);

  useEffect(() => {
    const getSupply = async () => {
      try {
        const data = await readContracts({
          contracts: [
            {
              address:
                chain!.id === 11155111
                  ? (process.env.NEXT_PUBLIC_JUSTART_SEPOLIA as `0x${string}`)
                  : (process.env.NEXT_PUBLIC_JUSTART as `0x${string}`),
              abi: JustArt.abi,
              functionName: "tokenId",
            },
          ],
        });
        setSupply(data[0].result as number);
      } catch (error) {
        console.error(error);
      }
    };
    getSupply();
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
        <div className="flex flex-row text-base lg:text-lg font-extrabold w-72 md:w-96 justify-between text-center self-center lg:self-end">
          <div>.005 eth</div>
          <div>{Number(supply) - 1}/12,000 minted.</div>
        </div>
        <div className="flex text-lg font-extrabold lg:justify-end justify-center">
          <Image
            src={barcode}
            className="flex w-72 md:w-96"
            alt="barcode"
            // style={{ width: "25%" }}
          />
        </div>
      </div>
    </div>
  );
}
