// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./RoleAccessControl.sol";
import "./AuditLogger.sol";

/**
 * @title IdentityRegistry
 * @dev Manages Decentralized Identifiers (DIDs) mapped to user wallet addresses.
 * Ensures one identity per wallet and integrates with RoleAccessControl and AuditLogger.
 */
contract IdentityRegistry {
    RoleAccessControl public rbac;
    AuditLogger public auditLogger;

    struct Identity {
        string did;             // e.g. "did:cyber:0x123..."
        address walletAddress;  // EVM wallet address
        string name;            // Name or display label
        string metadataURI;     // IPFS hash or metadata URI containing encrypted proofs
        bool isRegistered;      // Registration status
        bool isRevoked;         // Revocation status
        uint256 createdAt;      // Creation timestamp
        bytes32 assignedRole;   // Primary role assigned
    }

    mapping(address => Identity) private identities;
    mapping(string => address) private didToAddress;
    address[] private registeredAddresses;

    event IdentityRegistered(address indexed wallet, string did, string name, string metadataURI);
    event IdentityUpdated(address indexed wallet, string metadataURI);
    event IdentityRevoked(address indexed wallet, string did);

    modifier onlyAdmin() {
        require(rbac.hasRole(rbac.ADMIN_ROLE(), msg.sender), "IdentityRegistry: Must have ADMIN_ROLE");
        _;
    }

    modifier onlyManagerOrAdmin() {
        require(
            rbac.hasRole(rbac.ADMIN_ROLE(), msg.sender) || rbac.hasRole(rbac.MANAGER_ROLE(), msg.sender),
            "IdentityRegistry: Must have MANAGER_ROLE or ADMIN_ROLE"
        );
        _;
    }

    constructor(address _rbacAddress, address _auditLoggerAddress) {
        rbac = RoleAccessControl(_rbacAddress);
        auditLogger = AuditLogger(_auditLoggerAddress);
    }

    function registerIdentity(
        address wallet,
        string memory did,
        string memory name,
        string memory metadataURI,
        bytes32 role
    ) external onlyManagerOrAdmin {
        require(wallet != address(0), "IdentityRegistry: Invalid wallet address");
        require(!identities[wallet].isRegistered, "IdentityRegistry: Wallet already has registered identity");
        require(didToAddress[did] == address(0), "IdentityRegistry: DID already claimed");

        identities[wallet] = Identity({
            did: did,
            walletAddress: wallet,
            name: name,
            metadataURI: metadataURI,
            isRegistered: true,
            isRevoked: false,
            createdAt: block.timestamp,
            assignedRole: role
        });

        didToAddress[did] = wallet;
        registeredAddresses.push(wallet);

        if (role != bytes32(0)) {
            rbac.assignRole(role, wallet);
        }

        auditLogger.logEvent("IDENTITY_REGISTERED", msg.sender, wallet, string(abi.encodePacked("Registered DID: ", did, " for ", name)));

        emit IdentityRegistered(wallet, did, name, metadataURI);
    }

    function selfRegisterIdentity(
        string memory did,
        string memory name,
        string memory metadataURI
    ) external {
        require(!identities[msg.sender].isRegistered, "IdentityRegistry: Identity already registered");
        require(didToAddress[did] == address(0), "IdentityRegistry: DID already claimed");

        identities[msg.sender] = Identity({
            did: did,
            walletAddress: msg.sender,
            name: name,
            metadataURI: metadataURI,
            isRegistered: true,
            isRevoked: false,
            createdAt: block.timestamp,
            assignedRole: rbac.USER_ROLE()
        });

        didToAddress[did] = msg.sender;
        registeredAddresses.push(msg.sender);

        rbac.assignRole(rbac.USER_ROLE(), msg.sender);

        auditLogger.logEvent("IDENTITY_SELF_REGISTERED", msg.sender, msg.sender, string(abi.encodePacked("Self-Registered DID: ", did)));

        emit IdentityRegistered(msg.sender, did, name, metadataURI);
    }

    function updateIdentity(address wallet, string memory metadataURI) external {
        require(identities[wallet].isRegistered, "IdentityRegistry: Identity not registered");
        require(!identities[wallet].isRevoked, "IdentityRegistry: Identity revoked");
        require(
            msg.sender == wallet || rbac.hasRole(rbac.ADMIN_ROLE(), msg.sender),
            "IdentityRegistry: Unauthorized update"
        );

        identities[wallet].metadataURI = metadataURI;

        auditLogger.logEvent("IDENTITY_UPDATED", msg.sender, wallet, string(abi.encodePacked("Updated metadata for ", identities[wallet].did)));

        emit IdentityUpdated(wallet, metadataURI);
    }

    function revokeIdentity(address wallet) external onlyAdmin {
        require(identities[wallet].isRegistered, "IdentityRegistry: Identity not registered");
        require(!identities[wallet].isRevoked, "IdentityRegistry: Already revoked");

        identities[wallet].isRevoked = true;

        auditLogger.logEvent("IDENTITY_REVOKED", msg.sender, wallet, string(abi.encodePacked("Revoked DID: ", identities[wallet].did)));

        emit IdentityRevoked(wallet, identities[wallet].did);
    }

    function isIdentityValid(address wallet) external view returns (bool) {
        return identities[wallet].isRegistered && !identities[wallet].isRevoked;
    }

    function getIdentity(address wallet) external view returns (Identity memory) {
        return identities[wallet];
    }

    function getIdentityByDID(string memory did) external view returns (Identity memory) {
        address wallet = didToAddress[did];
        require(wallet != address(0), "IdentityRegistry: DID not found");
        return identities[wallet];
    }

    function getAllRegisteredAddresses() external view returns (address[] memory) {
        return registeredAddresses;
    }
}
