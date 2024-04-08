// SPDX-License-Identifier: MIT

pragma solidity >=0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@manifoldxyz/royalty-registry-solidity/contracts/specs/IEIP2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract JustArt is ERC721 {
    struct URIData {
        string name;
        string description;
        string image;
    }

    bool revealed;
    bool swapEnabled;

    address payable private royalties_recipient;

    uint256 public tokenId;
    uint256 public swappedTokenId;
    uint256 private royaltyAmount; //in %
    uint256 public immutable maxSupply = 12000;
    uint256 public immutable DIVISOR = 10000;

    mapping(uint256 => uint256) public tokenVisuals;
    mapping(uint256 => uint256) public receiptVisuals;
    mapping(uint256 => string) public visualNames;
    mapping(uint256 => bool) private isReceipt;

    string[] private uriComponents;
    string uri;

    URIData private URIDataPhase0;
    URIData private URIDataPhase1;
    URIData private URIDataPhase2;
    URIData private URIDataReceipt;

    mapping(address => bool) public isAdmin;

    constructor(
        URIData memory _URIDataPhase0,
        URIData memory _URIDataPhase1,
        URIData memory _URIDataPhase2,
        URIData memory _URIDataReceipt
    ) ERC721("JustArt", "JUSTART") {
        uriComponents = [
            'data:application/json;utf8,{"name":"',
            '", "description":"',
            '", "image":"',
            '", "attributes":[',
            "]}"
        ];
        isAdmin[msg.sender] = true;
        royalties_recipient = payable(msg.sender);
        royaltyAmount = 750;
        tokenId = 1;
        swappedTokenId = maxSupply + 1;
        URIDataPhase0 = _URIDataPhase0;
        URIDataPhase1 = _URIDataPhase1;
        URIDataPhase2 = _URIDataPhase2;
        URIDataReceipt = _URIDataReceipt;
        visualNames[0] = "American Gothic";
        visualNames[1] = "Mona Lisa";
        visualNames[2] = "The Starry Night";
        visualNames[3] = "Composition with Red, Blue and Yellow";
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721) returns (bool) {
        return
            ERC721.supportsInterface(interfaceId) ||
            interfaceId == type(IEIP2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    modifier adminRequired() {
        require(isAdmin[msg.sender], "Only admins can perfom this action");
        _;
    }

    function getPseudoRndNumber(
        uint256 _upperBound,
        uint256 _nonce
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, _nonce, msg.sender))
            ) % _upperBound;
    }

    function mint(address _to, uint256 _quantity) external adminRequired {
        require(_quantity <= 100, "Mint limited to 100 tokens at once");
        // Offsets tokenId as it's already incremented
        require((tokenId - 1) + _quantity <= maxSupply, "Max supply reached");
        for (uint256 i = 0; i < _quantity; i++) {
            uint256 visual = getPseudoRndNumber(4, tokenId);
            tokenVisuals[tokenId] = visual;
            _mint(_to, tokenId);
            tokenId++;
        }
    }

    function swap(uint256[] calldata _tokenIds) external {
        require(swapEnabled, "Swaps closed");
        require(_tokenIds.length % 4 == 0, "Requires 4 tokens to swap");
        require(
            _tokenIds.length <= 100,
            "Max 100 tokens can be swapped at once"
        );
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(ownerOf(_tokenIds[i]) == msg.sender, "Not the owner");
            _burn(_tokenIds[i]);
            if ((i + 1) % 4 == 0) {
                uint256 visual = getPseudoRndNumber(20, swappedTokenId);
                tokenVisuals[swappedTokenId] = visual;
                _mint(msg.sender, swappedTokenId);
                swappedTokenId++;
                isReceipt[swappedTokenId] = true;
                receiptVisuals[swappedTokenId] = visual % 4;
                _mint(msg.sender, swappedTokenId);
                swappedTokenId++;
            }
        }
    }

    function reveal() external adminRequired {
        revealed = true;
    }

    function enableSwaps() external adminRequired {
        swapEnabled = true;
    }

    function toggleAdmin(address _admin) external adminRequired {
        isAdmin[_admin] = !isAdmin[_admin];
    }

    function setURI(
        uint8 _phase,
        URIData memory _updatedURIData
    ) external adminRequired {
        _phase == 0
            ? URIDataPhase0 = _updatedURIData
            : _phase == 1
                ? URIDataPhase1 = _updatedURIData
                : _phase == 2
                    ? URIDataPhase2 = _updatedURIData
                    : URIDataReceipt = _updatedURIData;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        URIData memory _URIData;

        bytes memory _image = !revealed
            ? bytes(abi.encodePacked(_URIData.image))
            : bytes(
                abi.encodePacked(
                    _URIData.image,
                    Strings.toString(tokenVisuals[_tokenId]),
                    ".png"
                )
            );

        bytes memory _attribute;
        if (revealed) {
            if (_tokenId <= maxSupply) {
                _URIData = URIDataPhase1;
                _image = bytes(
                    abi.encodePacked(
                        _URIData.image,
                        Strings.toString(tokenVisuals[_tokenId]),
                        ".png"
                    )
                );
                _attribute = bytes(visualNames[tokenVisuals[_tokenId]]);
            } else if (isReceipt[_tokenId]) {
                _URIData = URIDataReceipt;
                _image = bytes(
                    abi.encodePacked(
                        _URIData.image,
                        Strings.toString(receiptVisuals[_tokenId]),
                        ".png"
                    )
                );
                _attribute = "What is it worth";
            } else {
                _URIData = URIDataPhase2;
                _image = bytes(
                    abi.encodePacked(
                        _URIData.image,
                        Strings.toString(tokenVisuals[_tokenId]),
                        ".png"
                    )
                );
                _attribute = abi.encodePacked(
                    "Untitled #",
                    Strings.toString(tokenVisuals[_tokenId] + 1)
                );
            }
        } else {
            _URIData = URIDataPhase0;
            _image = bytes(abi.encodePacked(_URIData.image));
            _attribute = "JustArt*";
        }

        bytes memory _name = bytes(
            abi.encodePacked(_URIData.name, Strings.toString(_tokenId))
        );

        bytes memory _attributes = bytes(
            abi.encodePacked(
                '{"trait_type": "Artwork", "value": "',
                _attribute,
                '"}'
            )
        );
        bytes memory _byteString = abi.encodePacked(
            abi.encodePacked(uriComponents[0], _name),
            abi.encodePacked(uriComponents[1], _URIData.description),
            abi.encodePacked(uriComponents[2], _image),
            abi.encodePacked(uriComponents[3], _attributes),
            abi.encodePacked(uriComponents[4])
        );
        return string(_byteString);
    }

    function setRoyalties(
        address payable _recipient,
        uint256 _royaltyPerCent
    ) external adminRequired {
        royalties_recipient = _recipient;
        royaltyAmount = _royaltyPerCent;
    }

    function royaltyInfo(
        uint256 _salePrice
    ) external view returns (address, uint256) {
        if (royalties_recipient != address(0)) {
            return (
                royalties_recipient,
                (_salePrice * royaltyAmount) / DIVISOR
            );
        }
        return (address(0), 0);
    }

    function withdraw(address _recipient) external adminRequired {
        payable(_recipient).transfer(address(this).balance);
    }
}
