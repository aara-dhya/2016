import { expect } from "chai";
import hre from "hardhat";

describe("Decentralized Identity, RBAC & NFT Asset Management Suite", function () {
  let RoleAccessControl, rbac;
  let AuditLogger, auditLogger;
  let IdentityRegistry, identityRegistry;
  let AssetManagerNFT, assetNFT;

  let owner, admin, manager, auditor, user1, user2;
  let ADMIN_ROLE, MANAGER_ROLE, AUDITOR_ROLE, USER_ROLE;

  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    [owner, admin, manager, auditor, user1, user2] = signers;

    // 1. Deploy RoleAccessControl
    RoleAccessControl = await hre.ethers.getContractFactory("RoleAccessControl");
    rbac = await RoleAccessControl.deploy();
    await rbac.waitForDeployment();

    ADMIN_ROLE = await rbac.ADMIN_ROLE();
    MANAGER_ROLE = await rbac.MANAGER_ROLE();
    AUDITOR_ROLE = await rbac.AUDITOR_ROLE();
    USER_ROLE = await rbac.USER_ROLE();

    // Setup roles
    await rbac.assignRole(ADMIN_ROLE, admin.address);
    await rbac.assignRole(MANAGER_ROLE, manager.address);
    await rbac.assignRole(AUDITOR_ROLE, auditor.address);

    // 2. Deploy AuditLogger
    AuditLogger = await hre.ethers.getContractFactory("AuditLogger");
    auditLogger = await AuditLogger.deploy(await rbac.getAddress());
    await auditLogger.waitForDeployment();

    // 3. Deploy IdentityRegistry
    IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy(
      await rbac.getAddress(),
      await auditLogger.getAddress()
    );
    await identityRegistry.waitForDeployment();

    // Link IdentityRegistry in RBAC
    await rbac.setIdentityRegistry(await identityRegistry.getAddress());

    // 4. Deploy AssetManagerNFT
    AssetManagerNFT = await hre.ethers.getContractFactory("AssetManagerNFT");
    assetNFT = await AssetManagerNFT.deploy(
      await rbac.getAddress(),
      await identityRegistry.getAddress(),
      await auditLogger.getAddress()
    );
    await assetNFT.waitForDeployment();
  });

  describe("Role-Based Access Control (RBAC)", function () {
    it("Should correctly assign roles to designated accounts", async function () {
      expect(await rbac.isAdmin(admin.address)).to.be.true;
      expect(await rbac.isManager(manager.address)).to.be.true;
      expect(await rbac.isAuditor(auditor.address)).to.be.true;
    });

    it("Should prevent non-admins from assigning roles", async function () {
      await expect(
        rbac.connect(user1).assignRole(MANAGER_ROLE, user2.address)
      ).to.be.revertedWith("RoleAccessControl: Must have ADMIN_ROLE or be IdentityRegistry");
    });
  });

  describe("Identity Registry (DIDs)", function () {
    it("Should allow manager to register user identity", async function () {
      const did = "did:cyber:0x1111111111111111111111111111111111111111";
      await identityRegistry
        .connect(manager)
        .registerIdentity(
          user1.address,
          did,
          "User One",
          "ipfs://QmProofHash123",
          USER_ROLE
        );

      const identity = await identityRegistry.getIdentity(user1.address);
      expect(identity.did).to.equal(did);
      expect(identity.name).to.equal("User One");
      expect(identity.isRegistered).to.be.true;
      expect(identity.isRevoked).to.be.false;
    });

    it("Should allow self-registration by end users", async function () {
      const did = "did:cyber:0x2222222222222222222222222222222222222222";
      await identityRegistry
        .connect(user2)
        .selfRegisterIdentity(did, "User Two", "ipfs://QmProofUser2");

      const identity = await identityRegistry.getIdentity(user2.address);
      expect(identity.isRegistered).to.be.true;
      expect(await rbac.isUser(user2.address)).to.be.true;
    });

    it("Should prevent duplicate DID registration", async function () {
      const did = "did:cyber:duplicate";
      await identityRegistry
        .connect(manager)
        .registerIdentity(
          user1.address,
          did,
          "User One",
          "ipfs://QmHash1",
          USER_ROLE
        );

      await expect(
        identityRegistry
          .connect(manager)
          .registerIdentity(
            user2.address,
            did,
            "User Two",
            "ipfs://QmHash2",
            USER_ROLE
          )
      ).to.be.revertedWith("IdentityRegistry: DID already claimed");
    });
  });

  describe("Asset Manager NFT & Soulbound Locking", function () {
    const didUser1 = "did:cyber:0x1111111111111111111111111111111111111111";
    const didUser2 = "did:cyber:0x2222222222222222222222222222222222222222";

    beforeEach(async function () {
      await identityRegistry
        .connect(manager)
        .registerIdentity(
          user1.address,
          didUser1,
          "User One",
          "ipfs://QmProofHash123",
          USER_ROLE
        );
      await identityRegistry
        .connect(manager)
        .registerIdentity(
          user2.address,
          didUser2,
          "User Two",
          "ipfs://QmProofHash456",
          USER_ROLE
        );
    });

    it("Should allow manager to mint locked (Soulbound) NFT to registered DID", async function () {
      await assetNFT
        .connect(manager)
        .mintAsset(
          user1.address,
          "Hardware Security Key v4",
          "Master FIDO2 Hardware Token",
          "SN-89412-CYBER",
          "Hardware Token",
          "ipfs://QmAssetMeta1",
          true
        );

      expect(await assetNFT.ownerOf(1)).to.equal(user1.address);
      const asset = await assetNFT.getAsset(1);
      expect(asset.name).to.equal("Hardware Security Key v4");
      expect(asset.isLocked).to.be.true;
      expect(asset.ownerDID).to.equal(didUser1);
    });

    it("Should prevent transferring locked Soulbound NFT", async function () {
      await assetNFT
        .connect(manager)
        .mintAsset(
          user1.address,
          "Soulbound Access License",
          "Classified Access Key",
          "SN-LIC-001",
          "Digital License",
          "ipfs://QmAssetMeta2",
          true
        );

      await expect(
        assetNFT
          .connect(user1)
          .transferFrom(user1.address, user2.address, 1)
      ).to.be.revertedWith(
        "AssetManagerNFT: Asset is Soulbound and currently locked against transfers"
      );
    });

    it("Should allow transferring asset after admin unlocks it", async function () {
      await assetNFT
        .connect(manager)
        .mintAsset(
          user1.address,
          "Transferable Equipment",
          "Drone Control Node",
          "SN-DRONE-77",
          "Hardware Asset",
          "ipfs://QmAssetMeta3",
          true
        );

      // Admin unlocks
      await assetNFT.connect(owner).setAssetLock(1, false);
      const updatedAsset = await assetNFT.getAsset(1);
      expect(updatedAsset.isLocked).to.be.false;

      // Transfer from user1 to user2
      await assetNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 1);

      expect(await assetNFT.ownerOf(1)).to.equal(user2.address);
      const finalAsset = await assetNFT.getAsset(1);
      expect(finalAsset.ownerDID).to.equal(didUser2);
    });

    it("Should prevent non-manager/non-admin from minting NFTs", async function () {
      await expect(
        assetNFT
          .connect(user1)
          .mintAsset(
            user1.address,
            "Unauthorized Token",
            "Test",
            "SN-FAKE",
            "Badge",
            "ipfs://Fake",
            false
          )
      ).to.be.revertedWith(
        "AssetManagerNFT: Must have MANAGER_ROLE or ADMIN_ROLE"
      );
    });
  });

  describe("Audit Logger System", function () {
    it("Should record audit logs for registered actions", async function () {
      const did = "did:cyber:0x9999999999999999999999999999999999999999";
      await identityRegistry
        .connect(manager)
        .registerIdentity(
          user1.address,
          did,
          "User One",
          "ipfs://QmProof",
          USER_ROLE
        );

      const logs = await auditLogger.getAllLogs();
      expect(logs.length).to.be.greaterThan(0);
      const lastLog = logs[logs.length - 1];
      expect(lastLog.actionType).to.equal("IDENTITY_REGISTERED");
      expect(lastLog.target).to.equal(user1.address);
    });
  });
});
