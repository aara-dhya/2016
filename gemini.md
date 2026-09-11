# Antigravity IDE Master Prompt: Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management

**Context & Role:**
You are an expert Web3 Full-Stack Developer and Blockchain Architect. I want you to build a complete, production-ready decentralized application (dApp) based on the provided hackathon specifications. This system will integrate Decentralized Identifiers (DIDs), Role-Based Access Control (RBAC), and NFT-based Digital Asset Management into a unified, trustless platform.

---

## 1. Project Overview
The objective is to create a blockchain-based framework that replaces vulnerable centralized identity and access management systems. The platform will securely manage user identities via DIDs, enforce permissions using smart contract-based RBAC, and tokenize physical/digital assets as NFTs to guarantee tamper-proof ownership, provenance, and authenticity. 

## 2. Target Tech Stack
*   **Smart Contracts:** Solidity (v0.8.20+)
*   **Development Environment:** Hardhat or Foundry
*   **Frontend Framework:** Next.js (App Router, TypeScript)
*   **Web3 Integration:** Wagmi / Viem / Ethers.js (v6)
*   **Wallet Connection:** RainbowKit or ConnectKit
*   **Styling:** Tailwind CSS + shadcn/ui
*   **Storage (NFT Metadata):** IPFS (via Pinata or Web3.Storage)
*   **Testing:** Chai/Mocha (Hardhat) or Forge standard library (Foundry)

---

## 3. Core Architecture & System Components

### A. Smart Contract Architecture
The on-chain logic must be modular, secure, and gas-efficient. Implement the following core contracts:

1.  **`IdentityRegistry.sol`**
    *   **Purpose:** Manages decentralized identifiers (DIDs) mapped to user wallet addresses.
    *   **Features:** Create, update, and revoke identities. Ensure one identity per wallet. Cryptographic proofs for verification.

2.  **`RoleAccessControl.sol` (RBAC)**
    *   **Purpose:** Enforces on-chain Role-Based Access Control.
    *   **Roles:** `ADMIN_ROLE`, `MANAGER_ROLE`, `AUDITOR_ROLE`, `USER_ROLE`.
    *   **Features:** Admins can grant/revoke roles. Modifiers (e.g., `onlyAdmin`, `hasRole`) to protect functions in other contracts.

3.  **`AssetManagerNFT.sol` (ERC721/ERC1155)**
    *   **Purpose:** Represents digital/physical assets as non-fungible tokens.
    *   **Features:** 
        *   Inherits from standard OpenZeppelin ERC721 extensions.
        *   **Restricted Minting:** ONLY `ADMIN_ROLE` or designated `MANAGER_ROLE` can mint NFTs.
        *   **Allocation:** Directly minted/allocated to a registered `IdentityRegistry` DID.
        *   **Tracking:** On-chain history of asset ownership and metadata URI pointers.

4.  **`AuditLogger.sol`**
    *   **Purpose:** Provides a centralized hub for emitting immutable event logs for every critical action.
    *   **Events:** `IdentityCreated`, `NFTMinted`, `AssetAllocated`, `RoleAssigned`, `OwnershipTransferred`.

### B. Frontend Architecture (Next.js)
Create a responsive, intuitive dashboard with dynamic routing based on the connected wallet's RBAC role.

*   **Public Landing Page:** Explain the platform and provide a "Connect Wallet" entry point.
*   **Admin Dashboard:** Interfaces to register new DIDs, assign RBAC roles, and mint/allocate NFTs to users.
*   **User Dashboard:** View personal DID details, manage profile, view owned NFT assets, and initiate transfers (if permitted).
*   **Auditor Dashboard:** A read-only interface to view the transparent audit trail, track NFT provenance, and verify identity claims.

---

## 4. Specific Implementation Requirements

### 1. Decentralized Identity (DID)
*   Implement a simplified DID registry on-chain.
*   Users must be registered in the system before they can receive assets or roles.
*   Store minimal metadata on-chain; store extended encrypted identity proofs on IPFS, keeping the hash on-chain.

### 2. Digital Asset NFTs
*   NFTs must not just be standard tokens; they should contain structurally typed metadata corresponding to physical or digital assets (e.g., Asset Name, Description, Serial Number, Issuance Date).
*   Implement a lock mechanism: some assets might be soulbound (non-transferable) until an admin unlocks them.

### 3. Role-Based Access Control (RBAC) Strict Enforcement
*   *Admins:* Can define roles, mint NFTs, assign NFTs to DIDs.
*   *Managers:* Can request asset creation, verify users.
*   *Auditors:* Read-only access to specific compliance views and audit logs.
*   *Users:* Can own assets, transfer (if allowed), and view their own data.
*   Ensure every write-function is protected by OpenZeppelin's `AccessControl`.

### 4. Immutable Audit Trail
*   Ensure that *every* state change emits a heavily indexed event.
*   Build a subgraph (The Graph) or use a frontend event indexer to construct a real-time, tamper-proof table of all system activities.

---

## 5. Execution Plan & Instructions for the IDE

Please generate the project systematically in the following phases:

**Phase 1: Project Setup & Configuration**
*   Initialize the Next.js project and Hardhat/Foundry environment.
*   Install all necessary dependencies (OpenZeppelin, Wagmi, Tailwind, etc.).

**Phase 2: Smart Contract Development**
*   Write `RoleAccessControl.sol`.
*   Write `IdentityRegistry.sol` (linked to RBAC).
*   Write `AssetManagerNFT.sol` (linked to RBAC and Identity Registry).
*   Write thorough unit tests covering positive cases and access-denial edge cases (e.g., a User trying to mint an NFT).

**Phase 3: Frontend Integration - Core Services**
*   Set up Wagmi/RainbowKit for wallet connection.
*   Create React hooks (`useIdentity`, `useAssets`, `useRoles`) to interact with the smart contracts.

**Phase 4: UI/UX Implementation**
*   Build the Admin panel (Forms for user registration, role assignment, NFT minting).
*   Build the User Profile page (Displaying owned NFTs as visual cards).
*   Build the Auditor log table (Fetching and decoding blockchain events).

**Phase 5: Final Polish & Security**
*   Implement error handling for reverted transactions.
*   Ensure the UI elegantly reflects loading states and transaction confirmations.

---

**Initial Action Request:**
Please start by generating the foundational Smart Contracts (`RoleAccessControl.sol` and `IdentityRegistry.sol`) with full NatSpec comments and OpenZeppelin integrations.

