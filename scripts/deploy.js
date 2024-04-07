// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
var fs = require("fs");
const contractsData = require("../logs/contractsData.json");

const DEFAULT_URI_DATA_PHASE_0 = {
  name: "JustArt* #",
  description:
    "after a while the meaning of a given work is valued by the price people are willing to pay.",
  image: "https://arweave.net/TiRpt56pd7hAEn8Aa9HHJnSi9iZBpvvidzrTWwZAfow",
};
const DEFAULT_URI_DATA_PHASE_1 = {
  name: "JustArt* #",
  description:
    "after a while the meaning of a given work is valued by the price people are willing to pay.",
  image: "https://arweave.net/1LxpZB7jljZDADFAcEmN-CDDck6VfbdAGrv8keTAGaI/",
};
const DEFAULT_URI_DATA_PHASE_2 = {
  name: "Untitled #",
  description:
    "after a while the meaning of a given work is valued by the price people are willing to pay.",
  image: "https://arweave.net/YeHJekpGktwjGx_7nzRdfd0jmGQh3Vr58p9ZTKmGyU4/",
};

const RECIPIENT_1 = "0xe630ed06B1B14ad4db042C04705DFF2429b934Bb";
const RECIPIENT_2 = "0xe630ed06B1B14ad4db042C04705DFF2429b934Bb";
const SHARE_RECIPIENT_1 = 8000;
const SHARE_RECIPIENT_2 = 2000;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const chainId = await deployer.getChainId();

  console.log(`Deploying JustArt on ${chainId} ...`);

  const JustArt = await ethers.getContractFactory("JustArt");
  const justArt = await JustArt.deploy(
    DEFAULT_URI_DATA_PHASE_0,
    DEFAULT_URI_DATA_PHASE_1,
    DEFAULT_URI_DATA_PHASE_2
  );
  await justArt.deployed();

  console.log(`JustArt deployed to ${justArt.address}`);

  console.log(`Deploying JustArtMint on ${chainId} ...`);

  const JustArtMint = await ethers.getContractFactory("JustArtMint");

  const justArtMintArgs = [
    justArt.address,
    RECIPIENT_1,
    RECIPIENT_2,
    SHARE_RECIPIENT_1,
    SHARE_RECIPIENT_2,
  ];
  const justArtMint = await JustArtMint.deploy(
    justArtMintArgs[0],
    justArtMintArgs[1],
    justArtMintArgs[2],
    justArtMintArgs[3],
    justArtMintArgs[4]
  );
  await justArtMint.deployed();

  console.log(`JustArtMint deployed to ${justArtMint.address}`);

  if (!contractsData[hre.network.name]) {
    contractsData[hre.network.name] = { JustArt: {}, JustArtMint: {} };
  }
  contractsData[hre.network.name]["JustArt"] = {
    contract: justArt.address,
    arguments: [
      DEFAULT_URI_DATA_PHASE_0,
      DEFAULT_URI_DATA_PHASE_1,
      DEFAULT_URI_DATA_PHASE_2,
    ],
  };
  contractsData[hre.network.name]["JustArtMint"] = {
    contract: justArtMint.address,
    arguments: justArtMintArgs,
  };

  await storeDeploymentInformation();

  console.log("Administering JustArt...");
  await justArt.toggleAdmin(justArtMint.address);

  console.log(contractsData);
}

async function storeDeploymentInformation() {
  !fs.existsSync("./logs") ? fs.mkdirSync("./logs") : undefined;
  fs.writeFileSync(
    `./logs/contractData_${Date.now()}.json`,
    JSON.stringify(contractsData)
  );
  fs.writeFileSync(`./logs/contractsData.json`, JSON.stringify(contractsData));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
