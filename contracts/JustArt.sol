// SPDX-License-Identifier: MIT

pragma solidity >=0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@manifoldxyz/royalty-registry-solidity/contracts/specs/IEIP2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract JustArt is ERC721 {
    struct URIData {
        string name;
        string description;
        string image;
    }

    address payable private royalties_recipient;

    uint256 public tokenId;
    uint256 public swappedTokenId;
    uint256 private royaltyAmount; //in %
    uint256 public immutable maxSupply = 10000;
    uint256 public immutable DIVISOR = 10000;

    mapping(uint256 => uint256) public tokenVisuals;

    string[] private uriComponents;
    string uri;

    URIData private URIDataPhase1;
    URIData private URIDataPhase2;

    mapping(address => bool) public isAdmin;

    constructor(
        URIData memory _URIDataPhase1,
        URIData memory _URIDataPhase2
    ) ERC721("JustArt", "JUSTART") {
        uriComponents = [
            'data:application/json;utf8,{"name":"',
            '", "description":"',
            '", "image":"',
            '"}'
        ];
        isAdmin[msg.sender] = true;
        royalties_recipient = payable(msg.sender);
        royaltyAmount = 750;
        tokenId = 1;
        swappedTokenId = maxSupply + 1;
        URIDataPhase1 = _URIDataPhase1;
        URIDataPhase2 = _URIDataPhase2;
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
        uint256 _upperBound
    ) internal returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, tokenId, msg.sender)
                )
            ) % _upperBound;
    }

    function mint(address _to, uint256 _quantity) external adminRequired {
        require(_quantity <= 100, "Mint limited to 100 tokens at once");
        // Offsets tokenId as it's already incremented
        require((tokenId - 1) + _quantity <= maxSupply, "Max supply reached");
        for (uint256 i = 0; i < _quantity; i++) {
            uint256 visual = getPseudoRndNumber(4);
            tokenVisuals[tokenId] = visual;
            _mint(_to, tokenId);
            tokenId++;
        }
    }

    function transform(uint256[] calldata _tokenIds) external {
        require(_tokenIds.length % 4 == 0, "Requires 4 tokens to swap");
        require(
            _tokenIds.length <= 100,
            "Max 100 tokens can be swapped at once"
        );
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(ownerOf(_tokenIds[i]) == msg.sender, "Not the owner");
            _burn(_tokenIds[i]);
            if ((i + 1) % 4 == 0) {
                uint256 visual = getPseudoRndNumber(20);
                tokenVisuals[tokenId] = visual;
                _mint(msg.sender, swappedTokenId);
                swappedTokenId++;
            }
        }
    }

    function toggleAdmin(address _admin) external adminRequired {
        isAdmin[_admin] = !isAdmin[_admin];
    }

    function setURI(string calldata _uri) external adminRequired {
        uri = _uri;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        URIData memory _URIData = _tokenId <= maxSupply
            ? URIDataPhase1
            : URIDataPhase2;

        bytes memory _name = bytes(
            abi.encodePacked(_URIData.name, Strings.toString(_tokenId))
        );

        bytes memory _image = bytes(
            abi.encodePacked(
                _URIData.image,
                Strings.toString(tokenVisuals[_tokenId]),
                ".png"
            )
        );
        bytes memory _byteString = abi.encodePacked(
            abi.encodePacked(uriComponents[0], _name),
            abi.encodePacked(uriComponents[1], _URIData.description),
            abi.encodePacked(uriComponents[2], _image),
            abi.encodePacked(uriComponents[3])
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
