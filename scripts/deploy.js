import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("=== Starting Cyberpunk Web3 Platform Deployment ===");

  const signers = await hre.ethers.getSigners();
  const [deployer, adminAcc, managerAcc, auditorAcc, user1Acc, user2Acc] = signers;

  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy RoleAccessControl
  const RoleAccessControl = await hre.ethers.getContractFactory("RoleAccessControl");
  const rbac = await RoleAccessControl.deploy();
  await rbac.waitForDeployment();
  const rbacAddress = await rbac.getAddress();
  console.log("-> RoleAccessControl deployed at:", rbacAddress);

  // 2. Deploy AuditLogger
  const AuditLogger = await hre.ethers.getContractFactory("AuditLogger");
  const auditLogger = await AuditLogger.deploy(rbacAddress);
  await auditLogger.waitForDeployment();
  const auditLoggerAddress = await auditLogger.getAddress();
  console.log("-> AuditLogger deployed at:", auditLoggerAddress);

  // 3. Deploy IdentityRegistry
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy(rbacAddress, auditLoggerAddress);
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("-> IdentityRegistry deployed at:", identityRegistryAddress);

  // Link IdentityRegistry in RBAC
  await rbac.setIdentityRegistry(identityRegistryAddress);

  // 4. Deploy AssetManagerNFT
  const AssetManagerNFT = await hre.ethers.getContractFactory("AssetManagerNFT");
  const assetNFT = await AssetManagerNFT.deploy(rbacAddress, identityRegistryAddress, auditLoggerAddress);
  await assetNFT.waitForDeployment();
  const assetNFTAddress = await assetNFT.getAddress();
  console.log("-> AssetManagerNFT deployed at:", assetNFTAddress);

  // Define roles
  const ADMIN_ROLE = await rbac.ADMIN_ROLE();
  const MANAGER_ROLE = await rbac.MANAGER_ROLE();
  const AUDITOR_ROLE = await rbac.AUDITOR_ROLE();
  const USER_ROLE = await rbac.USER_ROLE();

  console.log("\n=== Assigning Initial Roles ===");
  await rbac.assignRole(ADMIN_ROLE, adminAcc.address);
  await rbac.assignRole(MANAGER_ROLE, managerAcc.address);
  await rbac.assignRole(AUDITOR_ROLE, auditorAcc.address);
  await rbac.assignRole(USER_ROLE, user1Acc.address);
  await rbac.assignRole(USER_ROLE, user2Acc.address);
  console.log("Roles successfully granted.");

  console.log("\n=== Seeding Demo Decentralized Identifiers (DIDs) ===");
  // Register DIDs
  await identityRegistry.connect(managerAcc).registerIdentity(
    adminAcc.address,
    "did:cyber:admin:0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "Cyber System Administrator",
    "ipfs://bafkreididproofadmin001",
    ADMIN_ROLE
  );

  await identityRegistry.connect(managerAcc).registerIdentity(
    managerAcc.address,
    "did:cyber:manager:0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "Asset & Identity Manager",
    "ipfs://bafkreididproofmanager002",
    MANAGER_ROLE
  );

  await identityRegistry.connect(managerAcc).registerIdentity(
    auditorAcc.address,
    "did:cyber:auditor:0x90F79bf6EB2c4f8080653A214d5A230128c7c9ec",
    "Chief Compliance Auditor",
    "ipfs://bafkreididproofauditor003",
    AUDITOR_ROLE
  );

  await identityRegistry.connect(managerAcc).registerIdentity(
    user1Acc.address,
    "did:cyber:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "Alice Vance (Operator 01)",
    "ipfs://bafkreididproofalice004",
    USER_ROLE
  );

  await identityRegistry.connect(managerAcc).registerIdentity(
    user2Acc.address,
    "did:cyber:user:0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    "Bob Stone (Operator 02)",
    "ipfs://bafkreididproofbob005",
    USER_ROLE
  );
  console.log("DIDs successfully registered.");

  console.log("\n=== Seeding Tokenized Assets (NFTs) ===");
  // Mint demo NFTs
  await assetNFT.connect(managerAcc).mintAsset(
    user1Acc.address,
    "Titan Security Key v5",
    "High-assurance YubiKey-compat Cryptographic Hardware Enclave with Quantum-resistant Signature Module.",
    "SN-TITAN-9012-CYBER",
    "Hardware Security Module",
    "ipfs://bafkreihardwarekey001metadata",
    true // Locked / Soulbound
  );

  await assetNFT.connect(managerAcc).mintAsset(
    user1Acc.address,
    "Level-4 Quantum Node Pass",
    "Transferable High-Throughput Node Routing Clearance for Cyber Grid Network Alpha.",
    "SN-PASS-4410-ALPHA",
    "Access Credentials",
    "ipfs://bafkreiquantumpass002metadata",
    false // Unlocked
  );

  await assetNFT.connect(managerAcc).mintAsset(
    user2Acc.address,
    "Vault Locker #88 Ownership NFT",
    "Physical Vault Locker tokenization certificate for High-Density Storage Vault in Neo-City Enclave.",
    "SN-VAULT-88-CERT",
    "Physical Asset Token",
    "ipfs://bafkreivaultcert003metadata",
    true // Locked
  );

  console.log("Assets successfully minted.");

  // Write deployment data for frontend consumption
  const contractsDir = path.join(__dirname, "../src/contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const rbacArtifact = await hre.artifacts.readArtifact("RoleAccessControl");
  const auditArtifact = await hre.artifacts.readArtifact("AuditLogger");
  const identityArtifact = await hre.artifacts.readArtifact("IdentityRegistry");
  const assetArtifact = await hre.artifacts.readArtifact("AssetManagerNFT");

  const contractData = {
    network: "localhost",
    chainId: 31337,
    contracts: {
      RoleAccessControl: {
        address: rbacAddress,
        abi: rbacArtifact.abi
      },
      AuditLogger: {
        address: auditLoggerAddress,
        abi: auditArtifact.abi
      },
      IdentityRegistry: {
        address: identityRegistryAddress,
        abi: identityArtifact.abi
      },
      AssetManagerNFT: {
        address: assetNFTAddress,
        abi: assetArtifact.abi
      }
    },
    demoAccounts: {
      deployer: deployer.address,
      admin: adminAcc.address,
      manager: managerAcc.address,
      auditor: auditorAcc.address,
      user1: user1Acc.address,
      user2: user2Acc.address
    }
  };

  fs.writeFileSync(
    path.join(contractsDir, "contractData.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("\n=== Deployment Complete ===");
  console.log("Contract details saved to src/contracts/contractData.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
