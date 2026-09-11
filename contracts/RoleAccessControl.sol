// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleAccessControl
 * @dev Manages Role-Based Access Control (RBAC) for the decentralized platform.
 * Provides ADMIN_ROLE, MANAGER_ROLE, AUDITOR_ROLE, and USER_ROLE.
 */
contract RoleAccessControl is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    address public identityRegistry;

    event RoleGrantedCustom(address indexed account, bytes32 indexed role, address indexed sender);
    event RoleRevokedCustom(address indexed account, bytes32 indexed role, address indexed sender);
    event IdentityRegistrySet(address indexed registry);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(USER_ROLE, msg.sender);

        _setRoleAdmin(MANAGER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(AUDITOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(USER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "RoleAccessControl: Must have ADMIN_ROLE");
        _;
    }

    modifier onlyManagerOrAdmin() {
        require(
            hasRole(MANAGER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "RoleAccessControl: Must have MANAGER_ROLE or ADMIN_ROLE"
        );
        _;
    }

    modifier onlyAuditorOrAdmin() {
        require(
            hasRole(AUDITOR_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "RoleAccessControl: Must have AUDITOR_ROLE or ADMIN_ROLE"
        );
        _;
    }

    /**
     * @notice Set IdentityRegistry address authorized to assign default roles upon registration
     */
    function setIdentityRegistry(address _identityRegistry) external onlyAdmin {
        identityRegistry = _identityRegistry;
        emit IdentityRegistrySet(_identityRegistry);
    }

    /**
     * @notice Assign a role to an account (Admin or IdentityRegistry)
     */
    function assignRole(bytes32 role, address account) external {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || msg.sender == identityRegistry || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "RoleAccessControl: Must have ADMIN_ROLE or be IdentityRegistry"
        );
        _grantRole(role, account);
        emit RoleGrantedCustom(account, role, msg.sender);
    }

    /**
     * @notice Revoke a role from an account
     */
    function removeRole(bytes32 role, address account) external onlyAdmin {
        revokeRole(role, account);
        emit RoleRevokedCustom(account, role, msg.sender);
    }

    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function isManager(address account) external view returns (bool) {
        return hasRole(MANAGER_ROLE, account);
    }

    function isAuditor(address account) external view returns (bool) {
        return hasRole(AUDITOR_ROLE, account);
    }

    function isUser(address account) external view returns (bool) {
        return hasRole(USER_ROLE, account);
    }
}
