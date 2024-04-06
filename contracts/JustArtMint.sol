// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "./JustArt.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract JustArtMint {
    uint256 public price = 0.005 ether;
    uint256 public immutable limitPerWallet = 10;
    uint256 share1;
    uint256 share2;
    uint256 private immutable DIVISOR = 10000;

    address public justArtAddress;
    address private signer;
    address private recipient1;
    address private recipient2;

    bool public privateMintOpened;
    bool public publicMintOpened;

    mapping(address => bool) public isAdmin;
    mapping(address => bool) public minted;
    mapping(address => uint256) public quantityMinted;

    constructor(
        address _justArtAddress,
        address _recipient1,
        address _recipient2,
        uint256 _share1,
        uint256 _share2
    ) {
        recipient1 = _recipient1;
        recipient2 = _recipient2;
        signer = msg.sender;
        justArtAddress = _justArtAddress;
        isAdmin[msg.sender] = true;
        share1 = _share1;
        share2 = _share2;
    }

    modifier allowed(
        uint256 _quantity,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) {
        require(
            signer ==
                ecrecover(
                    keccak256(
                        abi.encodePacked(
                            "\x19Ethereum Signed Message:\n32",
                            keccak256(
                                abi.encodePacked(
                                    msg.sender,
                                    justArtAddress,
                                    _quantity + quantityMinted[msg.sender] <=
                                        limitPerWallet
                                )
                            )
                        )
                    ),
                    v,
                    r,
                    s
                ),
            "Invalid signature"
        );
        _;
    }

    function toggleAdmin(address _admin) external {
        require(isAdmin[msg.sender]);
        isAdmin[_admin] = !isAdmin[_admin];
    }

    function setRecipients(address _recipient1, address _recipient2) external {
        require(isAdmin[msg.sender]);
        recipient1 = _recipient1;
        recipient2 = _recipient2;
    }

    function setShares(uint256 _share1, uint256 _share2) external {
        require(isAdmin[msg.sender], "Unauthorized");
        require(_share1 + _share2 == DIVISOR, "Invalid shares split");
        share1 = _share1;
        share2 = _share2;
    }

    function setJustArtAddress(address _justArtAddress) external {
        require(isAdmin[msg.sender]);
        justArtAddress = _justArtAddress;
    }

    function setSigner(address _signer) external {
        require(isAdmin[msg.sender]);
        signer = _signer;
    }

    function togglePrivateMintStatus() external {
        require(isAdmin[msg.sender]);
        privateMintOpened = !privateMintOpened;
    }

    function togglePublicMintStatus() external {
        require(isAdmin[msg.sender]);
        publicMintOpened = !publicMintOpened;
    }

    function privateMint(
        uint256 _quantity,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable allowed(_quantity, v, r, s) {
        require(privateMintOpened, "Private Mint closed");
        quantityMinted[msg.sender] += _quantity;
        mint(_quantity);
    }

    function publicMint(uint256 _quantity) external payable {
        require(publicMintOpened, "Public Mint closed");
        mint(_quantity);
    }

    function mint(uint256 _quantity) internal {
        uint256 _price = price * _quantity;
        require(msg.value >= _price, "Not enough funds");
        require(minted[msg.sender] == false, "Only one NFT per wallet");
        minted[msg.sender] = true;
        bool successTransfer1 = payable(recipient1).send(
            (_price * share1) / DIVISOR
        );
        require(successTransfer1, "Transfer 1 failed");
        bool successTransfer2 = payable(recipient2).send(address(this).balance);
        require(successTransfer2, "Transfer 2 failed");
        JustArt(justArtAddress).mint(msg.sender, _quantity);
    }
}
