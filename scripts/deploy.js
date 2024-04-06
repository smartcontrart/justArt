// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
var fs = require("fs");
const contractsData = require("../logs/contractsData.json");

const unrevealedURI =
  "https://arweave.net/z0Z0w8Qwssb1Dh0vOrkhr5WkFhoOtCqcE8_MVNVH3zk";

const revealedURI =
  "https://arweave.net/L_mkz8t6tuF1l7UsZlUdOl8jBeEacIoiaS1Lw32t8Qk/";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);

  const chainId = await deployer.getChainId();

  console.log(`Deploying Wuzzles on ${chainId} ...`);

  const Wuzzles = await ethers.getContractFactory("Wuzzles");
  const wuzzles = await Wuzzles.deploy(unrevealedURI);
  await wuzzles.deployed();

  console.log(`Wuzzles deployed to ${wuzzles.address}`);

  console.log(`Deploying WuzzlesMint on ${chainId} ...`);

  const WuzzlesMint = await ethers.getContractFactory("WuzzlesMint");
  const wuzzlesMint = await WuzzlesMint.deploy(wuzzles.address);
  await wuzzlesMint.deployed();

  console.log(`WuzzlesMint deployed to ${wuzzlesMint.address}`);

  if (!contractsData[hre.network.name]) {
    contractsData[hre.network.name] = { Wuzzles: {}, WuzzlesMint: {} };
  }
  contractsData[hre.network.name]["Wuzzles"] = {
    contract: wuzzles.address,
    arguments: [unrevealedURI],
  };
  contractsData[hre.network.name]["WuzzlesMint"] = {
    contract: wuzzlesMint.address,
    arguments: [wuzzles.address],
  };

  await storeDeploymentInformation();

  console.log("Administering Wuzzles...");
  await wuzzles.toggleAdmin(wuzzlesMint.address);

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
