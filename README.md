# Nexus: Blockchain-Based Identity & Asset Platform

**Tech Stack:** Solidity, Express.js, React, Next.js, Hardhat, IPFS, Web3.js

Nexus is a decentralized identity and access management platform utilizing smart contracts to enforce Role-Based Access Control (RBAC) and prevent single points of failure.

## Features

- **Tamper-Proof Ownership:** Tokenized physical corporate assets as structurally typed NFTs, assigning them directly to employee DIDs to guarantee an immutable audit trail.
- **QR-Code Provisioning:** Custom system that links physical hardware (laptops, badges) to their respective on-chain NFT, allowing instant verification via a React-based web interface.
- **Frictionless Onboarding:** Secure backend orchestrator in Express.js listens for on-chain role assignment events and triggers automated external API actions for instant employee onboarding.

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the Next.js frontend
4. Run `node server/index.js` to start the Express backend relayer