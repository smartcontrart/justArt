require("dotenv").config();
const hre = require("hardhat");
const { ethers, upgrades, waffle } = require("hardhat");
const fs = require("fs");
const AL = require("../WL/WL.json");
const ALaddresses = AL.addresses;
const contractsData = require("../logs/contractsData.json");

async function main() {
  let signedAL = [];

  const [deployer] = await ethers.getSigners();

  console.log(contractsData[hre.network.name]["Wuzzles"].contract);
  for (i = 0; i < ALaddresses.length; i++) {
    let signature = {};
    const message = ethers.utils.solidityKeccak256(
      ["address", "address", "bool"],
      [
        ALaddresses[i],
        contractsData[hre.network.name]["Wuzzles"].contract,
        false,
      ]
    );
    let signedMessage = await deployer.signMessage(
      ethers.utils.arrayify(message)
    );
    const { v, r, s } = ethers.utils.splitSignature(signedMessage);

    signedAL.push({
      [ALaddresses[i]]: {
        v: v,
        r: r,
        s: s,
      },
    });
  }

  console.log(signedAL);
  fs.writeFileSync(`./client/signedList.json`, JSON.stringify(signedAL));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
