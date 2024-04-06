import type { NextPage } from "next";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBlockNumber } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Deploy from "../../components/Deploy";
import { Network, Alchemy } from "alchemy-sdk";

let userAddress: `0x${string}` | undefined;

const DeployPage: NextPage = () => {
  // const { address, connector, isConnected } = useAccount();
  return <div className="">{/* <Deploy /> */}</div>;
};

export default DeployPage;

// export async function getServerSideProps() {
//   try {
//     const config = {
//       apiKey: process.env.REACT_APP_ALCHEMY_KEY,
//       network: Network.ETH_GOERLI,
//     };
//     const alchemy = new Alchemy(config);
//     console.log(userAddress);
//     // const response = await alchemy.nft.getNftsForOwner(
//     //   userAddress as `0x${string}`,
//     //   {
//     //     contractAddresses: [`${process.env.NEXT_PUBLIC_KT_CONTRACT_ADDRESS}`],
//     //   }
//     // );
//     // console.log(response);
//     // const response = await fetch("https://pokeapi.co/api/v2/pokemon/");
//     // const data = await response.json();
//     const response = "test";
//     // console.log("Fetched data:", data);
//     return {
//       props: { tokens: response },
//     };
//   } catch (error) {
//     return {
//       props: { pokemons: [] }, // Set a default value if an error occurs
//     };
//   }
// }
