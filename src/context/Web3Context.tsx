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

  const loadInitialMockData = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      setIdentities(data.identities || []);
      setAssets(data.assets || []);
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      console.error('Failed to load state', err);
      setIdentities([]);
      setAssets([]);
      setAuditLogs([]);
    }
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
