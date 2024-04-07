const {
  time,
  mine,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades, waffle } = require("hardhat");
const hre = require("hardhat");
const DEFAULT_UPDATED_URI = {
  name: "Updated #",
  description: "Updated",
  image: "Updated/",
};
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
const MINT_PRICE = "0.005";
const DEFAULT_QUANTITY = 12;
const DEFAULT_SHARE_1 = 8000;
const DEFAULT_SHARE_2 = 2000;

describe("Just Art", function () {
  async function deployJustArt() {
    const [deployer, collector, anyone] = await ethers.getSigners();

    const JustArt = await hre.ethers.getContractFactory("JustArt");
    const justArt = await JustArt.deploy(
      DEFAULT_URI_DATA_PHASE_0,
      DEFAULT_URI_DATA_PHASE_1,
      DEFAULT_URI_DATA_PHASE_2
    );
    await justArt.deployed();

    return {
      justArt,
      deployer,
      collector,
      anyone,
    };
  }

  describe("Just Art Unit", function () {
    it("Should have a name", async function () {
      const { justArt } = await loadFixture(deployJustArt);
      expect(await justArt.name()).to.equal("JustArt");
    });

    it("Should have a symbol", async function () {
      const { justArt } = await loadFixture(deployJustArt);
      expect(await justArt.symbol()).to.equal("JUSTART");
    });

    it("Should allow to toggle an admin", async function () {
      const { justArt, deployer, collector } = await loadFixture(deployJustArt);
      await justArt.toggleAdmin(collector.address);
      expect(await justArt.isAdmin(collector.address)).to.equal(true);
    });

    it("Should be able to mint", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      await justArt.mint(collector.address, 1);
      expect(await justArt.balanceOf(collector.address)).to.equal(1);
    });

    it("Should prevent to mint more than 100 tokens at once", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      await expect(justArt.mint(collector.address, 101)).to.be.revertedWith(
        "Mint limited to 100 tokens at once"
      );
    });

    it("Should prevent to mint more than the max supply", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const maxSupply = await justArt.maxSupply();
      const bucket = maxSupply / 100;
      for (i = 0; i < bucket; i++) {
        await justArt.mint(collector.address, 100);
      }
      await expect(justArt.mint(collector.address, 1)).to.be.revertedWith(
        "Max supply reached"
      );
      const distribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
      for (let i = 0; i < maxSupply; i++) {
        const visual = await justArt.tokenVisuals(i);
        distribution[visual]++;
      }
      console.log(distribution);
    });

    it("Should prevent anyone from minting", async function () {
      const { justArt, collector, anyone } = await loadFixture(deployJustArt);
      await expect(
        justArt.connect(anyone).mint(collector.address, 1)
      ).to.be.revertedWith("Only admins can perfom this action");
    });

    it("Should allow an admin to reveal the drop", async function () {
      const { justArt } = await loadFixture(deployJustArt);
      expect(await justArt.reveal()).to.not.be.reverted;
    });

    it("Should prevent anyone from revealing the drop", async function () {
      const { justArt, anyone } = await loadFixture(deployJustArt);
      await expect(justArt.connect(anyone).reveal()).to.be.revertedWith(
        "Only admins can perfom this action"
      );
    });

    it("Should have a URI", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      await justArt.mint(collector.address, 1);
      const visual = await justArt.tokenVisuals(1);
      expect(await justArt.tokenURI(1)).to.equal(
        `data:application/json;utf8,{"name":"JustArt* #1", "description":"after a while the meaning of a given work is valued by the price people are willing to pay.", "image":"https://arweave.net/TiRpt56pd7hAEn8Aa9HHJnSi9iZBpvvidzrTWwZAfow"}`
      );
    });

    it("Should reveal the drop", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      await justArt.mint(collector.address, 1);
      await justArt.reveal();
      const visual = await justArt.tokenVisuals(1);
      expect(await justArt.tokenURI(1)).to.equal(
        `data:application/json;utf8,{"name":"JustArt* #1", "description":"after a while the meaning of a given work is valued by the price people are willing to pay.", "image":"https://arweave.net/1LxpZB7jljZDADFAcEmN-CDDck6VfbdAGrv8keTAGaI/${visual}.png"}`
      );
    });

    it("Should allow an admin to set a new URI in phase 0", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      await justArt.mint(collector.address, 1);
      await justArt.setURI(0, DEFAULT_UPDATED_URI);
      const visual = await justArt.tokenVisuals(1);
      expect(await justArt.tokenURI(1)).to.equal(
        `data:application/json;utf8,{"name":"Updated #1", "description":"Updated", "image":"Updated/"}`
      );
    });

    it("Should allow an admin to set a new URI in phase 1", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      await justArt.mint(collector.address, 1);
      await justArt.setURI(1, DEFAULT_UPDATED_URI);
      await justArt.reveal();
      const visual = await justArt.tokenVisuals(1);
      expect(await justArt.tokenURI(1)).to.equal(
        `data:application/json;utf8,{"name":"Updated #1", "description":"Updated", "image":"Updated/${visual}.png"}`
      );
    });

    it("Should allow an admin to set a new URI in phase 2", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const swappedTokenId = await justArt.swappedTokenId();
      const tokensToSwap = [1, 2, 3, 4];
      const visual = await justArt.tokenVisuals(swappedTokenId);
      await justArt.mint(collector.address, 100);
      await justArt.reveal();
      await justArt.connect(collector).swap(tokensToSwap);
      await justArt.setURI(2, DEFAULT_UPDATED_URI);
      expect(await justArt.tokenURI(swappedTokenId)).to.equal(
        `data:application/json;utf8,{"name":"Updated #${swappedTokenId}", "description":"Updated", "image":"Updated/${visual}.png"}`
      );
    });

    it("Should swap tokens", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const tokensToSwap = [1, 2, 3, 4];
      await justArt.mint(collector.address, 100);
      await expect(justArt.connect(collector).swap(tokensToSwap)).to.not.be
        .reverted;
    });

    it("Swapped tokens should be burnt", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const tokensToSwap = [1, 2, 3, 4];
      await justArt.mint(collector.address, 100);
      await justArt.connect(collector).swap(tokensToSwap);
      for (let i = 0; i < tokensToSwap.length; i++) {
        await expect(justArt.tokenURI(tokensToSwap[i])).to.be.reverted;
      }
    });

    it("Swapping tokens should issue a phase 2 token", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const tokensToSwap = [1, 2, 3, 4];
      const maxSupply = await justArt.maxSupply();
      const swappedTokenId = await justArt.swappedTokenId();
      await justArt.mint(collector.address, 100);
      await justArt.connect(collector).swap(tokensToSwap);
      expect(await justArt.ownerOf(swappedTokenId)).to.equal(collector.address);
    });

    it("Should revert if not a multiple of 4 tokens is passed to swap", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const tokensToSwap = [1, 2, 3, 4, 5];
      await justArt.mint(collector.address, 8);
      await expect(
        justArt.connect(collector).swap(tokensToSwap)
      ).to.be.revertedWith("Requires 4 tokens to swap");
    });

    it("Should not swap more than 100 tokens at once", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const tokensToSwap = [];
      await justArt.mint(collector.address, 100);
      await justArt.mint(collector.address, 4);
      for (let i = 0; i < 104; i++) {
        tokensToSwap.push(i + 1);
      }
      await expect(
        justArt.connect(collector).swap(tokensToSwap)
      ).to.be.revertedWith("Max 100 tokens can be swapped at once");
    });

    it("Phase 2 tokens should have phase 2 URIData", async function () {
      const { justArt, collector } = await loadFixture(deployJustArt);
      const tokensToSwap = [1, 2, 3, 4];
      const swappedTokenId = await justArt.swappedTokenId();
      const visual = await justArt.tokenVisuals(swappedTokenId);
      await justArt.mint(collector.address, 100);
      await justArt.reveal();
      await justArt.connect(collector).swap(tokensToSwap);
      expect(await justArt.tokenURI(swappedTokenId)).to.equal(
        `data:application/json;utf8,{"name":"Untitled #${swappedTokenId}", "description":"after a while the meaning of a given work is valued by the price people are willing to pay.", "image":"https://arweave.net/YeHJekpGktwjGx_7nzRdfd0jmGQh3Vr58p9ZTKmGyU4/${visual}.png"}`
      );
    });

    // Need to test the visuals pre/post swap
  });
});

describe("JustArtMint Unit", function () {
  async function deployJustArtMint() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, collector, anyone] = await ethers.getSigners();

    const JustArt = await hre.ethers.getContractFactory("JustArt");
    const justArt = await JustArt.deploy(
      DEFAULT_URI_DATA_PHASE_0,
      DEFAULT_URI_DATA_PHASE_1,
      DEFAULT_URI_DATA_PHASE_2
    );
    await justArt.deployed();

    const JustArtMint = await hre.ethers.getContractFactory("JustArtMint");
    const justArtMint = await JustArtMint.deploy(
      justArt.address,
      deployer.address,
      collector.address,
      DEFAULT_SHARE_1,
      DEFAULT_SHARE_2
    );
    await justArtMint.deployed();

    const signatures = {};
    const approvedList = [collector.address, anyone.address];
    for (i = 0; i < approvedList.length; i++) {
      const message = ethers.utils.solidityKeccak256(
        ["address", "address", "bool"],
        [approvedList[i], justArt.address, true]
      );
      let signedMessage = await deployer.signMessage(
        ethers.utils.arrayify(message)
      );
      const { v, r, s } = ethers.utils.splitSignature(signedMessage);
      signatures[approvedList[i]] = {
        v: v,
        r: r,
        s: s,
      };
    }

    return {
      justArt,
      justArtMint,
      deployer,
      collector,
      anyone,
      signatures,
    };
  }

  describe("JustArtMint Unit", function () {
    it("Should have the JustArt address", async function () {
      const { justArt, justArtMint } = await loadFixture(deployJustArtMint);
      expect(await justArtMint.justArtAddress()).to.equal(justArt.address);
    });

    it("Should allow to set the recipients", async function () {
      const { justArtMint, deployer, anyone } = await loadFixture(
        deployJustArtMint
      );
      await expect(
        justArtMint
          .connect(deployer)
          .setRecipients(deployer.address, anyone.address)
      ).to.not.be.reverted;
    });

    it("Should prevent anyone to set the recipient", async function () {
      const { justArtMint, collector, anyone } = await loadFixture(
        deployJustArtMint
      );
      await expect(
        justArtMint
          .connect(anyone)
          .setRecipients(collector.address, anyone.address)
      ).to.be.reverted;
    });

    it("Should allow to set the shares", async function () {
      const { justArtMint, deployer } = await loadFixture(deployJustArtMint);
      await expect(justArtMint.connect(deployer).setShares(7000, 3000)).to.not
        .be.reverted;
    });

    it("should prevent to set the shares if they don't add up to 10000", async function () {
      const { justArtMint, deployer } = await loadFixture(deployJustArtMint);
      await expect(
        justArtMint.connect(deployer).setShares(7000, 2000)
      ).to.be.revertedWith("Invalid shares split");
    });

    it("Should prevent anyone to set the shares", async function () {
      const { justArtMint, anyone } = await loadFixture(deployJustArtMint);
      await expect(justArtMint.connect(anyone).setShares(7000, 3000)).to.be
        .reverted;
    });

    it("Should allow to mint on the private sale", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      const signature = signatures[collector.address];
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePrivateMintStatus();
      await justArtMint
        .connect(collector)
        .privateMint(DEFAULT_QUANTITY, signature.v, signature.r, signature.s, {
          value:
            BigInt(ethers.utils.parseEther(MINT_PRICE)) *
            BigInt(DEFAULT_QUANTITY),
        });
      expect(await justArt.balanceOf(collector.address)).to.equal(
        DEFAULT_QUANTITY
      );
    });

    it("Should transfer funds to recipient 1 and recipient 2", async function () {
      const { justArt, justArtMint, deployer, collector, anyone, signatures } =
        await loadFixture(deployJustArtMint);
      const signature = signatures[anyone.address];
      const deployerBalanceBefore = await ethers.provider.getBalance(
        deployer.address
      );
      const collectorBalanceBefore = await ethers.provider.getBalance(
        collector.address
      );
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePrivateMintStatus();
      const price =
        BigInt(ethers.utils.parseEther(MINT_PRICE)) * BigInt(DEFAULT_QUANTITY);
      await justArtMint
        .connect(anyone)
        .privateMint(DEFAULT_QUANTITY, signature.v, signature.r, signature.s, {
          value: price,
        });
      const deployerBalanceAfter = await ethers.provider.getBalance(
        deployer.address
      );
      const collectorBalanceAfter = await ethers.provider.getBalance(
        collector.address
      );
      expect(deployerBalanceAfter).to.be.greaterThan(deployerBalanceBefore);
      expect(collectorBalanceAfter).to.be.greaterThan(collectorBalanceBefore);
    });

    it("Should prevent to mint on the private sale with insufficient funds", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      const signature = signatures[collector.address];
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePrivateMintStatus();
      await expect(
        justArtMint
          .connect(collector)
          .privateMint(
            DEFAULT_QUANTITY,
            signature.v,
            signature.r,
            signature.s,
            {
              value: ethers.utils.parseEther(MINT_PRICE),
            }
          )
      ).to.be.revertedWith("Not enough funds");
    });

    it("Should prevent to private mint when closed", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      const signature = signatures[collector.address];
      await justArt.toggleAdmin(justArtMint.address);
      await expect(
        justArtMint
          .connect(collector)
          .privateMint(
            DEFAULT_QUANTITY,
            signature.v,
            signature.r,
            signature.s,
            {
              value:
                BigInt(ethers.utils.parseEther(MINT_PRICE)) *
                BigInt(DEFAULT_QUANTITY),
            }
          )
      ).to.be.revertedWith("Private Mint closed");
    });

    it("should prevent to mint more than 10 NFTs at once, per wallet during the private sale", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      const signature = signatures[collector.address];
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePrivateMintStatus();
      await expect(
        justArtMint
          .connect(collector)
          .privateMint(
            DEFAULT_QUANTITY + 1,
            signature.v,
            signature.r,
            signature.s,
            {
              value:
                BigInt(ethers.utils.parseEther(MINT_PRICE)) *
                BigInt(DEFAULT_QUANTITY + 1),
            }
          )
      ).to.be.revertedWith("Invalid signature");
    });

    it("should prevent to mint more than 10 NFTs in multiple times, per wallet during the private sale", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      const signature = signatures[collector.address];
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePrivateMintStatus();
      await justArtMint
        .connect(collector)
        .privateMint(
          DEFAULT_QUANTITY - 1,
          signature.v,
          signature.r,
          signature.s,
          {
            value:
              BigInt(ethers.utils.parseEther(MINT_PRICE)) *
              BigInt(DEFAULT_QUANTITY - 1),
          }
        );
      await expect(
        justArtMint
          .connect(collector)
          .privateMint(2, signature.v, signature.r, signature.s, {
            value: BigInt(ethers.utils.parseEther(MINT_PRICE)) * BigInt(2),
          })
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should prevent to public mint when closed", async function () {
      const { justArt, justArtMint, collector } = await loadFixture(
        deployJustArtMint
      );

      await justArt.toggleAdmin(justArtMint.address);
      await expect(
        justArtMint.connect(collector).publicMint(DEFAULT_QUANTITY, {
          value:
            BigInt(ethers.utils.parseEther(MINT_PRICE)) *
            BigInt(DEFAULT_QUANTITY),
        })
      ).to.be.revertedWith("Public Mint closed");
    });

    it("Should prevent to mint when not enough funds are sent ", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      const signature = signatures[collector.address];
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePrivateMintStatus();
      await expect(
        justArtMint
          .connect(collector)
          .privateMint(
            DEFAULT_QUANTITY,
            signature.v,
            signature.r,
            signature.s,
            {
              value: ethers.utils.parseEther("0"),
            }
          )
      ).to.be.revertedWith("Not enough funds");
    });

    it("Should allow to mint on the public sale", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePublicMintStatus();
      await justArtMint.connect(collector).publicMint(DEFAULT_QUANTITY, {
        value:
          BigInt(ethers.utils.parseEther(MINT_PRICE)) *
          BigInt(DEFAULT_QUANTITY),
      });
      expect(await justArt.balanceOf(collector.address)).to.equal(
        DEFAULT_QUANTITY
      );
    });

    it("Should allow to mint multiple times on the public sale", async function () {
      const { justArt, justArtMint, collector, signatures } = await loadFixture(
        deployJustArtMint
      );
      await justArt.toggleAdmin(justArtMint.address);
      await justArtMint.togglePublicMintStatus();
      await justArtMint.connect(collector).publicMint(DEFAULT_QUANTITY, {
        value:
          BigInt(ethers.utils.parseEther(MINT_PRICE)) *
          BigInt(DEFAULT_QUANTITY),
      });

      expect(
        await justArtMint.connect(collector).publicMint(DEFAULT_QUANTITY, {
          value:
            BigInt(ethers.utils.parseEther(MINT_PRICE)) *
            BigInt(DEFAULT_QUANTITY),
        })
      ).to.not.be.reverted;
    });
  });
});
