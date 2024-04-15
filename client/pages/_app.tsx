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
import { alchemyProvider } from "@wagmi/core/providers/alchemy";
import { infuraProvider } from "@wagmi/core/providers/infura";
import {
  braveWallet,
  rabbyWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    base,
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY }),
    publicProvider(),
  ]
);

const { wallets } = getDefaultWallets({
  appName: "JustArt*",
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
    <main className="min-h-screen text-black">
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
