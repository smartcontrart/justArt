import type { AppProps } from "next/app";
import "dotenv/config";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  ConnectButton,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, sepolia, WagmiConfig } from "wagmi";
import {
  arbitrum,
  goerli,
  mainnet,
  optimism,
  polygon,
  base,
  zora,
} from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";
import {
  braveWallet,
  rabbyWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
// import { Nanum_Gothic_Coding } from "next/font/google";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    base,
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "Wuzzles",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other",
    wallets: [braveWallet({ chains }), rabbyWallet({ chains })],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen text-white ">
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider
          chains={chains}
          theme={lightTheme({
            accentColor: "white",
            accentColorForeground: "black",
          })}
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </main>
  );
}

export default MyApp;
