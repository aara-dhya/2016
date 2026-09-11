// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./RoleAccessControl.sol";
import "./IdentityRegistry.sol";
import "./AuditLogger.sol";

/**
 * @title AssetManagerNFT
 * @dev Manages tokenized physical and digital assets as ERC721 NFTs.
 * Features restricted minting, DID allocation, metadata, and Soulbound asset transfer locking.
 */
contract AssetManagerNFT is ERC721URIStorage {
    RoleAccessControl public rbac;
    IdentityRegistry public identityRegistry;
    AuditLogger public auditLogger;

    uint256 private _nextTokenId;

    struct AssetDetails {
        uint256 tokenId;
        string name;
        string description;
        string serialNumber;
        uint256 issuanceDate;
        string assetType;
        bool isLocked;
        string ownerDID;
        address creator;
    }

    mapping(uint256 => AssetDetails) public assetDetails;
    mapping(address => uint256[]) private _userTokenIds;

    event AssetMinted(uint256 indexed tokenId, address indexed recipient, string ownerDID, string name, bool isLocked);
    event AssetLockToggled(uint256 indexed tokenId, bool isLocked, address indexed changedBy);
    event AssetTransferredWithDID(uint256 indexed tokenId, address indexed from, address indexed to, string newDID);

    modifier onlyAdmin() {
        require(rbac.hasRole(rbac.ADMIN_ROLE(), msg.sender), "AssetManagerNFT: Must have ADMIN_ROLE");
        _;
    }

    modifier onlyManagerOrAdmin() {
        require(
            rbac.hasRole(rbac.ADMIN_ROLE(), msg.sender) || rbac.hasRole(rbac.MANAGER_ROLE(), msg.sender),
            "AssetManagerNFT: Must have MANAGER_ROLE or ADMIN_ROLE"
        );
        _;
    }

    constructor(
        address _rbacAddress,
        address _identityRegistryAddress,
        address _auditLoggerAddress
    ) ERC721("CyberAssetNFT", "CAST") {
        rbac = RoleAccessControl(_rbacAddress);
        identityRegistry = IdentityRegistry(_identityRegistryAddress);
        auditLogger = AuditLogger(_auditLoggerAddress);
    }

    function mintAsset(
        address recipient,
        string memory name,
        string memory description,
        string memory serialNumber,
        string memory assetType,
        string memory metadataURI,
        bool isLocked
    ) external onlyManagerOrAdmin returns (uint256) {
        require(identityRegistry.isIdentityValid(recipient), "AssetManagerNFT: Recipient must have a valid registered DID");

        IdentityRegistry.Identity memory recipientIdentity = identityRegistry.getIdentity(recipient);

        _nextTokenId++;
        uint256 newTokenId = _nextTokenId;

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        assetDetails[newTokenId] = AssetDetails({
            tokenId: newTokenId,
            name: name,
            description: description,
            serialNumber: serialNumber,
            issuanceDate: block.timestamp,
            assetType: assetType,
            isLocked: isLocked,
            ownerDID: recipientIdentity.did,
            creator: msg.sender
        });

        _userTokenIds[recipient].push(newTokenId);

        auditLogger.logEvent(
            "ASSET_MINTED",
            msg.sender,
            recipient,
            string(abi.encodePacked("Minted Token #", _toString(newTokenId), ": ", name, " (DID: ", recipientIdentity.did, ")"))
        );

        emit AssetMinted(newTokenId, recipient, recipientIdentity.did, name, isLocked);

        return newTokenId;
    }

    function setAssetLock(uint256 tokenId, bool isLocked) external onlyAdmin {
        require(_ownerOf(tokenId) != address(0), "AssetManagerNFT: Token does not exist");
        assetDetails[tokenId].isLocked = isLocked;

        auditLogger.logEvent(
            "ASSET_LOCK_TOGGLED",
            msg.sender,
            _ownerOf(tokenId),
            string(abi.encodePacked("Set Lock status for Token #", _toString(tokenId), " to ", isLocked ? "LOCKED" : "UNLOCKED"))
        );

        emit AssetLockToggled(tokenId, isLocked, msg.sender);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            require(!assetDetails[tokenId].isLocked, "AssetManagerNFT: Asset is Soulbound and currently locked against transfers");
            require(identityRegistry.isIdentityValid(to), "AssetManagerNFT: Recipient must have a valid registered DID");

            IdentityRegistry.Identity memory recipientIdentity = identityRegistry.getIdentity(to);
            assetDetails[tokenId].ownerDID = recipientIdentity.did;

            _removeTokenFromUser(from, tokenId);
            _userTokenIds[to].push(tokenId);

            auditLogger.logEvent(
                "ASSET_TRANSFERRED",
                from,
                to,
                string(abi.encodePacked("Transferred Token #", _toString(tokenId), " to DID: ", recipientIdentity.did))
            );

            emit AssetTransferredWithDID(tokenId, from, to, recipientIdentity.did);
        }

        return super._update(to, tokenId, auth);
    }

    function getAsset(uint256 tokenId) external view returns (AssetDetails memory) {
        require(_ownerOf(tokenId) != address(0), "AssetManagerNFT: Token does not exist");
        return assetDetails[tokenId];
    }

    function getUserTokenIds(address user) external view returns (uint256[] memory) {
        return _userTokenIds[user];
    }

    function _removeTokenFromUser(address user, uint256 tokenId) private {
        uint256[] storage tokens = _userTokenIds[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
