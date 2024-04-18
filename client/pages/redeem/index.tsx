import type { NextPage } from "next";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBlockNumber } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Network, Alchemy } from "alchemy-sdk";
import Redeem from "../../components/Redeem";

let userAddress: `0x${string}` | undefined;

const RedeemPage: NextPage = () => {
  const { address, connector, isConnected } = useAccount();
  return <div className="">{<Redeem />}</div>;
  return null;
};

export default RedeemPage;
