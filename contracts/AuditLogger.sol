// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./RoleAccessControl.sol";

/**
 * @title AuditLogger
 * @dev Provides a centralized hub for emitting immutable event logs for every critical platform action.
 * Also stores an on-chain queryable list of log entries for transparent auditing.
 */
contract AuditLogger {
    RoleAccessControl public rbac;

    struct LogEntry {
        uint256 id;
        uint256 timestamp;
        string actionType;
        address actor;
        address target;
        string details;
    }

    LogEntry[] private auditLogs;

    event PlatformLogEmitted(
        uint256 indexed id,
        uint256 indexed timestamp,
        string actionType,
        address indexed actor,
        address target,
        string details
    );

    event IdentityCreated(address indexed user, string did, string name, string metadataURI);
    event IdentityUpdated(address indexed user, string did, string metadataURI);
    event IdentityRevoked(address indexed user, string did);
    event RoleAssigned(address indexed account, bytes32 indexed role, address indexed assignedBy);
    event RoleRevoked(address indexed account, bytes32 indexed role, address indexed revokedBy);
    event NFTMinted(uint256 indexed tokenId, address indexed recipient, string did, string name, string assetType, bool isLocked);
    event AssetAllocated(uint256 indexed tokenId, address indexed previousOwner, address indexed newOwner, string did);
    event AssetLockedStatusChanged(uint256 indexed tokenId, bool isLocked, address indexed changedBy);
    event OwnershipTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor(address _rbacAddress) {
        rbac = RoleAccessControl(_rbacAddress);
    }

    function logEvent(
        string memory actionType,
        address actor,
        address target,
        string memory details
    ) external returns (uint256) {
        uint256 newId = auditLogs.length + 1;
        LogEntry memory entry = LogEntry({
            id: newId,
            timestamp: block.timestamp,
            actionType: actionType,
            actor: actor,
            target: target,
            details: details
        });

        auditLogs.push(entry);

        emit PlatformLogEmitted(newId, block.timestamp, actionType, actor, target, details);
        return newId;
    }

    function getLogCount() external view returns (uint256) {
        return auditLogs.length;
    }

    function getLogs(uint256 offset, uint256 limit) external view returns (LogEntry[] memory) {
        uint256 total = auditLogs.length;
        if (offset >= total) {
            return new LogEntry[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultSize = end - offset;
        LogEntry[] memory result = new LogEntry[](resultSize);

        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = auditLogs[offset + i];
        }

        return result;
    }

    function getAllLogs() external view returns (LogEntry[] memory) {
        return auditLogs;
    }
}
