import { useState, useContext, useEffect } from "react";
import {
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  readContracts,
} from "wagmi";
import Image from "next/image";
import plus from "../visuals/plus.svg";
import minus from "../visuals/minus.svg";
import JustArt from "../contracts/JustArt.sol/JustArt.json";
import JustArtMint from "../contracts/JustArtMint.sol/JustArtMint.json";
import PrivateMint from "./PrivateMint";
import PublicMint from "./PublicMint";
import signedList from "../signedList.json";
import { MissingCustomChainError } from "web3";

export default function UserInterface() {
  const [signedMessage, setSignedMessage] = useState({ v: "", r: "", s: "" });
  const [mintPrice, setMintPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const { address, connector, isConnected } = useAccount();
  const [supply, setSupply] = useState(0);
  const [privateMint, setPrivateMint] = useState(false);
  const [publicMint, setPublicMint] = useState(false);

  const { chain, chains } = useNetwork();

  useEffect(() => {
    const findSignedMessage = async (account: any) => {
      let signedMessage = { v: "", r: "", s: "" };
      for (let i = 0; i < signedList.length; i++) {
        let key = Object.keys(signedList[i])[0];
        if (key.toLowerCase() === address.toLowerCase()) {
          signedMessage = signedList[i][key];
        }
      }
      setSignedMessage(signedMessage);
    };

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

    const privateMintStatus = async () => {
      try {
        const data = await readContracts({
          contracts: [
            {
              address:
                chain!.id === 11155111
                  ? (process.env
                      .NEXT_PUBLIC_JUSTART_MINT_SEPOLIA as `0x${string}`)
                  : (process.env.NEXT_PUBLIC_JUSTART_MINT as `0x${string}`),
              abi: JustArtMint.abi,
              functionName: "privateMintOpened",
            },
          ],
        });
        setPrivateMint(data[0].result as boolean);
        if (data[0].result === true) {
          setQuantity(12);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const publicMintStatus = async () => {
      try {
        const data = await readContracts({
          contracts: [
            {
              address:
                chain!.id === 11155111
                  ? (process.env
                      .NEXT_PUBLIC_JUSTART_MINT_SEPOLIA as `0x${string}`)
                  : (process.env.NEXT_PUBLIC_JUSTART_MINT as `0x${string}`),
              abi: JustArtMint.abi,
              functionName: "publicMintOpened",
            },
          ],
        });
        setPublicMint(data[0].result as boolean);
        if (data[0].result === true) {
          setQuantity(50);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchMintPrice = async () => {
      try {
        const data = await readContracts({
          contracts: [
            {
              address:
                chain!.id === 11155111
                  ? (process.env
                      .NEXT_PUBLIC_JUSTART_MINT_SEPOLIA as `0x${string}`)
                  : (process.env.NEXT_PUBLIC_JUSTART_MINT as `0x${string}`),
              abi: JustArtMint.abi,
              functionName: "price",
            },
          ],
        });
        if ((data[0].result as number) >= 0) {
          setMintPrice(data[0].result as number);
        }
      } catch (error) {
        console.error(error);
      }
    };
    findSignedMessage(address);
    getSupply();
    privateMintStatus();
    publicMintStatus();
    fetchMintPrice();
  }, [address, chain, publicMint, privateMint]);

  const updateQuantity = (e: any) => {
    controlValue(parseInt(e.target.value));
  };

  const increaseQuantity = () => {
    controlValue(quantity + 1);
  };

  const decreaseQuantity = () => {
    controlValue(quantity - 1);
  };

  const controlValue = (value) => {
    const cap = privateMint ? 12 : publicMint ? 100 : 0;
    if (value < 0) {
      setQuantity(0);
      return;
    } else if (value > cap) {
      setQuantity(cap);
      return;
    } else {
      setQuantity(value);
    }
  };

  return (
    <div className="flex self-center">
      <div className="m-5 flex flex-col justify-center">
        {privateMint ? (
          <PrivateMint quantity={quantity} price={mintPrice} />
        ) : publicMint ? (
          <PublicMint quantity={quantity} price={mintPrice} />
        ) : (
          <button
            disabled
            className="text-xl color-change rounded-3xl px-4  disabled:opacity-20"
          >
            mint.
          </button>
        )}
        {privateMint ? (
          <div className="text-xs text-center">max 12 per wallet</div>
        ) : publicMint ? (
          <span>
            <div className="text-xs text-center">unlimited.</div>
            <div className="text-xs text-center"> max 100 per tx</div>
          </span>
        ) : (
          <div className="text-xs text-center">drop closed</div>
        )}
        {signedMessage.v !== "" && !publicMint ? (
          <div className="text-xs text-left">wallet whitelisted</div>
        ) : null}
      </div>
      <div className="flex border border-black self-center rounded-3xl text-black px-2">
        <Image
          src={minus}
          alt="minus"
          style={{ width: "10px" }}
          onClick={decreaseQuantity}
        />
        <form>
          <input
            className="text-center"
            type="number"
            min="0"
            onChange={(e) => updateQuantity(e)}
            value={quantity}
            style={{ background: "none", width: "80px" }}
          ></input>
        </form>
        <Image
          src={plus}
          alt="plus"
          style={{ width: "10px" }}
          onClick={increaseQuantity}
        />
      </div>
    </div>
  );
}
