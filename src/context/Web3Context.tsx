'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

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

export const BLANK_PERSONA: Persona = {
  key: 'sysadmin',
  name: 'System Admin',
  role: 'ADMIN',
  address: '0x0000000000000000000000000000000000000000',
  did: 'did:nexus:sysadmin:0x000',
  description: 'System Administrator'
};

interface Web3ContextType {
  account: string;
  activePersona: Persona;
  setActivePersona: (persona: Persona) => void;
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
  const [activePersona, setActivePersona] = useState<Persona>(BLANK_PERSONA);
  const [identities, setIdentities] = useState<IdentityData[]>([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] Enterprise SaaS Security Enclave initialized.',
    '[NETWORK] Connected to Local Ledger (ChainID: 31337).',
    '[AUTH] Awaiting Authentication...'
  ]);
  const [selectedIPFSURI, setSelectedIPFSURI] = useState<string | null>(null);

  const addTerminalLog = (msg: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setTerminalLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const inspectIPFS = (uri: string) => {
    setSelectedIPFSURI(uri);
  };

  const closeIPFSModal = () => {
    setSelectedIPFSURI(null);
  };

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
        name: 'Asset & Identity Officer',
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
        name: 'Vault Locker #88 Ownership Certificate',
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
        details: 'RoleAccessControl and IdentityRegistry initialized on system registry.'
      },
      {
        id: 2,
        timestamp: Date.now() - 86400000 * 4,
        actionType: 'IDENTITY_REGISTERED',
        actor: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        target: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        details: 'Registered MANAGER_ROLE for Asset & Identity Officer.'
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
        actionType: 'ASSET_REGISTERED',
        actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        target: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        details: 'Registered Asset Credential #1 (Titan Security Key v5) for Alice Vance.'
      },
      {
        id: 5,
        timestamp: Date.now() - 86400000 * 1.5,
        actionType: 'ASSET_REGISTERED',
        actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        target: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        details: 'Registered Transferable Asset #2 (Level-4 Quantum Node Pass) for Alice Vance.'
      },
      {
        id: 6,
        timestamp: Date.now() - 86400000 * 1,
        actionType: 'ASSET_REGISTERED',
        actor: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        target: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        details: 'Registered Asset Credential #3 (Vault Locker #88 Ownership Certificate) for Bob Stone.'
      }
    ];

    setIdentities(mockIdentities);
    setAssets(mockAssets);
    setAuditLogs(mockAuditLogs);
  };

  useEffect(() => {
    loadInitialMockData();
  }, []);

  // switchPersona function has been removed. Active persona is set via login in page.tsx

  const registerIdentity = async (
    wallet: string,
    name: string,
    metadataURI: string,
    role: string
  ): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[SYSTEM] Provisioning user identity for ${name} (${wallet})...`);

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
    addTerminalLog(`[SUCCESS] User identity created. DID: ${newDID}`);
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
    addTerminalLog(`[SYSTEM] Registering digital asset '${name}' for ${recipient}...`);

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
      actionType: 'ASSET_REGISTERED',
      actor: activePersona.address,
      target: recipient,
      details: `Issued Credential #${newAssetId} (${name}) - Soulbound: ${isLocked ? 'TRUE' : 'FALSE'}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Asset Credential #${newAssetId} issued. Soulbound: ${isLocked}`);
    setLoading(false);
    return true;
  };

  const toggleAssetLock = async (tokenId: number, isLocked: boolean): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[SYSTEM] Updating transfer lock for Asset #${tokenId} -> ${isLocked ? 'LOCKED' : 'UNLOCKED'}...`);

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
      details: `Admin changed lock status for Asset #${tokenId} to ${isLocked ? 'LOCKED (Soulbound)' : 'UNLOCKED'}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Asset #${tokenId} lock status updated to ${isLocked ? 'LOCKED' : 'UNLOCKED'}`);
    setLoading(false);
    return true;
  };

  const transferAsset = async (tokenId: number, recipientAddress: string): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[SYSTEM] Initiating credential transfer for Asset #${tokenId} to ${recipientAddress}...`);

    const asset = assets.find(a => a.tokenId === tokenId);
    if (!asset) {
      addTerminalLog(`[ERROR] Asset #${tokenId} not found.`);
      setLoading(false);
      return false;
    }

    if (asset.isLocked) {
      addTerminalLog(`[REVERT] Transfer Blocked: Asset is Soulbound and locked by administrator policy.`);
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
      details: `Transferred Asset #${tokenId} (${asset.name}) from ${activePersona.address} to DID: ${newDID}`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    addTerminalLog(`[SUCCESS] Asset #${tokenId} transferred to ${recipientAddress}`);
    setLoading(false);
    return true;
  };

  const assignRole = async (targetAddress: string, roleName: string): Promise<boolean> => {
    setLoading(true);
    addTerminalLog(`[SYSTEM] Granting ${roleName} to ${targetAddress}...`);

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
    addTerminalLog(`[SYSTEM] Revoking user credentials for ${walletAddress}...`);

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
    addTerminalLog(`[SUCCESS] User credentials revoked for ${walletAddress}`);
    setLoading(false);
    return true;
  };

  const refreshState = async () => {
    addTerminalLog('[REFRESH] Synchronizing system telemetry...');
  };

  return (
    <Web3Context.Provider
      value={{
        account: activePersona.address,
        activePersona,
        setActivePersona,
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
