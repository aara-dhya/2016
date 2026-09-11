'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractData from '../contracts/contractData.json';

export type RoleType = 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'USER' | 'NONE';

export interface IdentityData {
  did: string;
  walletAddress: string;
  name: string;
  metadataURI: string;
  isRegistered: boolean;
  isRevoked: boolean;
  createdAt: number;
  assignedRole: string;
}

export interface AssetData {
  tokenId: number;
  name: string;
  description: string;
  serialNumber: string;
  issuanceDate: number;
  assetType: string;
  isLocked: boolean;
  ownerDID: string;
  creator: string;
  ownerAddress: string;
}

export interface AuditLogData {
  id: number;
  timestamp: number;
  actionType: string;
  actor: string;
  target: string;
  details: string;
}

export interface Persona {
  key: string;
  name: string;
  role: RoleType;
  address: string;
  did: string;
  description: string;
}

export const DEMO_PERSONAS: Persona[] = [
  {
    key: 'admin',
    name: 'SysAdmin Enclave',
    role: 'ADMIN',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    did: 'did:cyber:admin:0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    description: 'System Administrator - Full Access, Role Management & Lock Controls'
  },
  {
    key: 'manager',
    name: 'Asset Officer',
    role: 'MANAGER',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    did: 'did:cyber:manager:0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    description: 'Asset Manager - Minting, Identity Verification & Provisioning'
  },
  {
    key: 'auditor',
    name: 'Chief Auditor',
    role: 'AUDITOR',
    address: '0x90F79bf6EB2c4f8080653A214d5A230128c7c9ec',
    did: 'did:cyber:auditor:0x90F79bf6EB2c4f8080653A214d5A230128c7c9ec',
    description: 'Compliance Auditor - Read-Only Global Immutable Ledger Access'
  },
  {
    key: 'user1',
    name: 'Alice Vance (Operator 01)',
    role: 'USER',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    did: 'did:cyber:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    description: 'Standard User - Holds Security Key (Soulbound) & Pass NFT'
  },
  {
    key: 'user2',
    name: 'Bob Stone (Operator 02)',
    role: 'USER',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    did: 'did:cyber:user:0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    description: 'Standard User - Holds Vault Locker Certificate NFT'
  }
];

interface Web3ContextType {
  account: string;
  activePersona: Persona;
  switchPersona: (personaKey: string) => void;
  activeRole: RoleType;
  identities: IdentityData[];
  assets: AssetData[];
  auditLogs: AuditLogData[];
  loading: boolean;
  terminalLogs: string[];
  addTerminalLog: (msg: string) => void;
  registerIdentity: (wallet: string, name: string, metadataURI: string, role: string) => Promise<boolean>;
  mintAsset: (recipient: string, name: string, desc: string, serial: string, type: string, metadataURI: string, isLocked: boolean) => Promise<boolean>;
  toggleAssetLock: (tokenId: number, isLocked: boolean) => Promise<boolean>;
  transferAsset: (tokenId: number, recipientAddress: string) => Promise<boolean>;
  assignRole: (targetAddress: string, roleName: string) => Promise<boolean>;
  revokeIdentity: (walletAddress: string) => Promise<boolean>;
  refreshState: () => Promise<void>;
  inspectIPFS: (uri: string) => void;
  selectedIPFSURI: string | null;
  closeIPFSModal: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePersona, setActivePersona] = useState<Persona>(DEMO_PERSONAS[0]);
  const [identities, setIdentities] = useState<IdentityData[]>([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] Cyberpunk Web3 Node initialized.',
    '[NET] Connected to Local Hardhat Enclave (ChainID: 31337).',
    `[AUTH] Active Session: ${DEMO_PERSONAS[0].name} (${DEMO_PERSONAS[0].role})`
  ]);
  const [selectedIPFSURI, setSelectedIPFSURI] = useState<string | null>(null);

  const addTerminalLog = (msg: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setTerminalLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const getProvider = () => {
    return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  };

  const inspectIPFS = (uri: string) => {
    setSelectedIPFSURI(uri);
  };

  const closeIPFSModal = () => {
    setSelectedIPFSURI(null);
  };

  // Mock initial state for immediate rich interactive demo
  const loadInitialMockData = () => {
    const mockIdentities: IdentityData[] = [
      {
        did: 'did:cyber:admin:0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        name: 'Cyber System Administrator',
        metadataURI: 'ipfs://bafkreididproofadmin001',
        isRegistered: true,
        isRevoked: false,
        createdAt: Date.now() - 86400000 * 5,
        assignedRole: 'ADMIN_ROLE'
      },
      {
        did: 'did:cyber:manager:0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        name: 'Asset & Identity Manager',
        metadataURI: 'ipfs://bafkreididproofmanager002',
        isRegistered: true,
        isRevoked: false,
        createdAt: Date.now() - 86400000 * 4,
        assignedRole: 'MANAGER_ROLE'
      },
      {
        did: 'did:cyber:auditor:0x90F79bf6EB2c4f8080653A214d5A230128c7c9ec',
        walletAddress: '0x90F79bf6EB2c4f8080653A214d5A230128c7c9ec',
        name: 'Chief Compliance Auditor',
        metadataURI: 'ipfs://bafkreididproofauditor003',
        isRegistered: true,
        isRevoked: false,
        createdAt: Date.now() - 86400000 * 3,
        assignedRole: 'AUDITOR_ROLE'
      },
      {
        did: 'did:cyber:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        name: 'Alice Vance (Operator 01)',
        metadataURI: 'ipfs://bafkreididproofalice004',
        isRegistered: true,
        isRevoked: false,
        createdAt: Date.now() - 86400000 * 2,
        assignedRole: 'USER_ROLE'
      },
      {
        did: 'did:cyber:user:0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        name: 'Bob Stone (Operator 02)',
        metadataURI: 'ipfs://bafkreididproofbob005',
        isRegistered: true,
        isRevoked: false,
        createdAt: Date.now() - 86400000 * 1,
        assignedRole: 'USER_ROLE'
      }
    ];

    const mockAssets: AssetData[] = [
      {
        tokenId: 1,
        name: 'Titan Security Key v5',
        description: 'High-assurance YubiKey-compat Cryptographic Hardware Enclave with Quantum-resistant Signature Module.',
        serialNumber: 'SN-TITAN-9012-CYBER',
        issuanceDate: Date.now() - 86400000 * 2,
        assetType: 'Hardware Security Module',
        isLocked: true,
        ownerDID: 'did:cyber:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        ownerAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
      },
      {
        tokenId: 2,
        name: 'Level-4 Quantum Node Pass',
        description: 'Transferable High-Throughput Node Routing Clearance for Cyber Grid Network Alpha.',
        serialNumber: 'SN-PASS-4410-ALPHA',
        issuanceDate: Date.now() - 86400000 * 1.5,
        assetType: 'Access Credentials',
        isLocked: false,
        ownerDID: 'did:cyber:user:0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        ownerAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
      },
      {
        tokenId: 3,
        name: 'Vault Locker #88 Ownership NFT',
        description: 'Physical Vault Locker tokenization certificate for High-Density Storage Vault in Neo-City Enclave.',
        serialNumber: 'SN-VAULT-88-CERT',
        issuanceDate: Date.now() - 86400000 * 1,
        assetType: 'Physical Asset Token',
        isLocked: true,
        ownerDID: 'did:cyber:user:0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        ownerAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'
      }
    ];

    const mockAuditLogs: AuditLogData[] = [
      {
        id: 1,
        timestamp: Date.now() - 86400000 * 5,
        actionType: 'SYSTEM_GENESIS',
        actor: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        target: '0x0000000000000000000000000000000000000000',
        details: 'RoleAccessControl and IdentityRegistry initialized on chain 31337.'
      },
      {
        id: 2,
        timestamp: Date.now() - 86400000 * 4,
        actionType: 'IDENTITY_REGISTERED',
        actor: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        target: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        details: 'Registered MANAGER_ROLE for Asset & Identity Manager.'
      },
      {
        id: 3,
        timestamp: Date.now() - 86400000 * 3,
        actionType: 'IDENTITY_REGISTERED',
        actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        target: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        details: 'Registered DID did:cyber:user:0x15d34AAf... for Alice Vance.'
      },
      {
        id: 4,
        timestamp: Date.now() - 86400000 * 2,
        actionType: 'ASSET_MINTED',
        actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        target: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        details: 'Minted Soulbound NFT Token #1 (Titan Security Key v5) for Alice Vance.'
      },
      {
        id: 5,
        timestamp: Date.now() - 86400000 * 1.5,
        actionType: 'ASSET_MINTED',
        actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        target: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        details: 'Minted Unlocked NFT Token #2 (Level-4 Quantum Node Pass) for Alice Vance.'
      },
      {
        id: 6,
        timestamp: Date.now() - 86400000 * 1,
        actionType: 'ASSET_MINTED',
        actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        target: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        details: 'Minted Soulbound NFT Token #3 (Vault Locker #88 Ownership NFT) for Bob Stone.'
      }
    ];

    setIdentities(mockIdentities);
    setAssets(mockAssets);
    setAuditLogs(mockAuditLogs);
  };

  useEffect(() => {
    loadInitialMockData();
  }, []);

  const switchPersona = (personaKey: string) => {
    const found = DEMO_PERSONAS.find(p => p.key === personaKey);
    if (found) {
      setActivePersona(found);
      addTerminalLog(`Switched active persona to ${found.name} (${found.role})`);
    }
  };

  const registerIdentity = async (
    wallet: string,
    name: string,
    metadataURI: string,
    role: string
  ): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[TX] Registering identity for ${name} (${wallet})...`);

    const newDID = `did:cyber:${role.toLowerCase()}:${wallet}`;
    const newId: IdentityData = {
      did: newDID,
      walletAddress: wallet,
      name,
      metadataURI,
      isRegistered: true,
      isRevoked: false,
      createdAt: Date.now(),
      assignedRole: `${role}_ROLE`
    };

    setIdentities(prev => [newId, ...prev]);

    const newLog: AuditLogData = {
      id: auditLogs.length + 1,
      timestamp: Date.now(),
      actionType: 'IDENTITY_REGISTERED',
      actor: activePersona.address,
      target: wallet,
      details: `Registered DID ${newDID} for ${name} with role ${role}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Identity created. DID: ${newDID}`);
    setLoading(false);
    return true;
  };

  const mintAsset = async (
    recipient: string,
    name: string,
    desc: string,
    serial: string,
    type: string,
    metadataURI: string,
    isLocked: boolean
  ): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[TX] Minting NFT Asset '${name}' to ${recipient}...`);

    const targetIdentity = identities.find(i => i.walletAddress.toLowerCase() === recipient.toLowerCase());
    const ownerDID = targetIdentity ? targetIdentity.did : `did:cyber:user:${recipient}`;

    const newAssetId = assets.length + 1;
    const newAsset: AssetData = {
      tokenId: newAssetId,
      name,
      description: desc,
      serialNumber: serial,
      issuanceDate: Date.now(),
      assetType: type,
      isLocked,
      ownerDID,
      creator: activePersona.address,
      ownerAddress: recipient
    };

    setAssets(prev => [newAsset, ...prev]);

    const newLog: AuditLogData = {
      id: auditLogs.length + 1,
      timestamp: Date.now(),
      actionType: 'ASSET_MINTED',
      actor: activePersona.address,
      target: recipient,
      details: `Minted NFT Token #${newAssetId} (${name}) - Locked: ${isLocked ? 'TRUE (Soulbound)' : 'FALSE'}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] NFT Token #${newAssetId} minted. Soulbound: ${isLocked}`);
    setLoading(false);
    return true;
  };

  const toggleAssetLock = async (tokenId: number, isLocked: boolean): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[TX] Toggling Lock state for Token #${tokenId} -> ${isLocked ? 'LOCKED' : 'UNLOCKED'}...`);

    setAssets(prev =>
      prev.map(a => (a.tokenId === tokenId ? { ...a, isLocked } : a))
    );

    const targetAsset = assets.find(a => a.tokenId === tokenId);
    const newLog: AuditLogData = {
      id: auditLogs.length + 1,
      timestamp: Date.now(),
      actionType: 'ASSET_LOCK_TOGGLED',
      actor: activePersona.address,
      target: targetAsset ? targetAsset.ownerAddress : activePersona.address,
      details: `Admin changed lock status for Token #${tokenId} to ${isLocked ? 'LOCKED (Soulbound)' : 'UNLOCKED'}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Token #${tokenId} lock status updated to ${isLocked ? 'LOCKED' : 'UNLOCKED'}`);
    setLoading(false);
    return true;
  };

  const transferAsset = async (tokenId: number, recipientAddress: string): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[TX] Initiating transfer for Token #${tokenId} to ${recipientAddress}...`);

    const asset = assets.find(a => a.tokenId === tokenId);
    if (!asset) {
      addTerminalLog(`[REVERT] Error: Token #${tokenId} not found.`);
      setLoading(false);
      return false;
    }

    if (asset.isLocked) {
      addTerminalLog(`[REVERT] Transaction Reverted! Asset is Soulbound and locked against transfers.`);
      setLoading(false);
      return false;
    }

    const recipientIdentity = identities.find(i => i.walletAddress.toLowerCase() === recipientAddress.toLowerCase());
    const newDID = recipientIdentity ? recipientIdentity.did : `did:cyber:user:${recipientAddress}`;

    setAssets(prev =>
      prev.map(a =>
        a.tokenId === tokenId ? { ...a, ownerAddress: recipientAddress, ownerDID: newDID } : a
      )
    );

    const newLog: AuditLogData = {
      id: auditLogs.length + 1,
      timestamp: Date.now(),
      actionType: 'ASSET_TRANSFERRED',
      actor: activePersona.address,
      target: recipientAddress,
      details: `Transferred Token #${tokenId} (${asset.name}) from ${activePersona.address} to DID: ${newDID}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Token #${tokenId} transferred to ${recipientAddress}`);
    setLoading(false);
    return true;
  };

  const assignRole = async (targetAddress: string, roleName: string): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[TX] Assigning ${roleName} to ${targetAddress}...`);

    setIdentities(prev =>
      prev.map(i =>
        i.walletAddress.toLowerCase() === targetAddress.toLowerCase()
          ? { ...i, assignedRole: `${roleName}_ROLE` }
          : i
      )
    );

    const newLog: AuditLogData = {
      id: auditLogs.length + 1,
      timestamp: Date.now(),
      actionType: 'ROLE_ASSIGNED',
      actor: activePersona.address,
      target: targetAddress,
      details: `Granted ${roleName}_ROLE to ${targetAddress}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Granted ${roleName}_ROLE to ${targetAddress}`);
    setLoading(false);
    return true;
  };

  const revokeIdentity = async (walletAddress: string): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[TX] Revoking Identity for ${walletAddress}...`);

    setIdentities(prev =>
      prev.map(i =>
        i.walletAddress.toLowerCase() === walletAddress.toLowerCase()
          ? { ...i, isRevoked: true }
          : i
      )
    );

    const newLog: AuditLogData = {
      id: auditLogs.length + 1,
      timestamp: Date.now(),
      actionType: 'IDENTITY_REVOKED',
      actor: activePersona.address,
      target: walletAddress,
      details: `Revoked identity and credentials for ${walletAddress}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Identity revoked for ${walletAddress}`);
    setLoading(false);
    return true;
  };

  const refreshState = async () => {
    addTerminalLog('[REFRESH] Refreshing state telemetry...');
  };

  return (
    <Web3Context.Provider
      value={{
        account: activePersona.address,
        activePersona,
        switchPersona,
        activeRole: activePersona.role,
        identities,
        assets,
        auditLogs,
        loading,
        terminalLogs,
        addTerminalLog,
        registerIdentity,
        mintAsset,
        toggleAssetLock,
        transferAsset,
        assignRole,
        revokeIdentity,
        refreshState,
        inspectIPFS,
        selectedIPFSURI,
        closeIPFSModal
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
