// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
var fs = require("fs");
const fetch = require("node-fetch");
const contractsData = require("../logs/contractsData.json");

async function updateMetadata() {
  for (let i = 1; i <= 900; i++) {
    const url = `https://opensea.io/assets/base/0xed6e89cfe9a725effd6f86107eb12594221146da/${i}/?force_update=true`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Error fetching data for asset ${i}: ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log(`Fetched data for asset ${i}`);
      // Process the fetched data here (e.g., store it in a database)
    } catch (error) {
      console.error(`Error fetching data for asset ${i}:`, error);
    }
  }

  async () => {
    for (let i = 1; i <= 900; i++) {
      await fetchData(i);
    }
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
updateMetadata().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
