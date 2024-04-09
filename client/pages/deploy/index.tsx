import type { NextPage } from "next";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBlockNumber } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Deploy from "../../components/Deploy";
import { Network, Alchemy } from "alchemy-sdk";

let userAddress: `0x${string}` | undefined;

const DeployPage: NextPage = () => {
  // const { address, connector, isConnected } = useAccount();
  // return <div className="">{<Deploy />}</div>;
  return null;
};

export default DeployPage;
