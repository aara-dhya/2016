'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ShieldAlert, UserPlus, PlusCircle, Lock, Unlock, UserX, ExternalLink, Key, CheckCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    account,
    activeRole,
    identities,
    assets,
    registerIdentity,
    mintAsset,
    toggleAssetLock,
    assignRole,
    revokeIdentity,
    inspectIPFS,
    loading
  } = useWeb3();

  // Form States
  const [didWallet, setDidWallet] = useState('');
  const [didName, setDidName] = useState('');
  const [didIPFS, setDidIPFS] = useState('');
  const [didRole, setDidRole] = useState('USER');

  const [nftRecipient, setNftRecipient] = useState('');
  const [nftName, setNftName] = useState('');
  const [nftDesc, setNftDesc] = useState('');
  const [nftSerial, setNftSerial] = useState('');
  const [nftCategory, setNftCategory] = useState('Hardware Security Module');
  const [nftIPFS, setNftIPFS] = useState('');
  const [nftIsLocked, setNftIsLocked] = useState(true);

  const [didSuccessMsg, setDidSuccessMsg] = useState('');
  const [nftSuccessMsg, setNftSuccessMsg] = useState('');

  const handleRegisterDID = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!didWallet || !didName) return;

    const metadataURI = didIPFS || `ipfs://bafkreididproof${Date.now()}`;
    const success = await registerIdentity(didWallet, didName, metadataURI, didRole);
    if (success) {
      setDidSuccessMsg(`Identity & DID created for ${didName}!`);
      setDidWallet('');
      setDidName('');
      setDidIPFS('');
      setTimeout(() => setDidSuccessMsg(''), 5000);
    }
  };

  const handleMintNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nftRecipient || !nftName) return;

    const metadataURI = nftIPFS || `ipfs://bafkreibaseassetmeta${Date.now()}`;
    const success = await mintAsset(
      nftRecipient,
      nftName,
      nftDesc,
      nftSerial || `SN-${Math.floor(Math.random() * 89999 + 10000)}-CYBER`,
      nftCategory,
      metadataURI,
      nftIsLocked
    );

    if (success) {
      setNftSuccessMsg(`NFT Asset '${nftName}' minted to ${nftRecipient}!`);
      setNftName('');
      setNftDesc('');
      setNftSerial('');
      setNftIPFS('');
      setTimeout(() => setNftSuccessMsg(''), 5000);
    }
  };

  if (activeRole !== 'ADMIN' && activeRole !== 'MANAGER') {
    return (
      <div className="cyber-card border-2 border-[#FF3333] p-8 text-center space-y-4">
        <ShieldAlert size={48} className="mx-auto text-[#FF3333]" />
        <h2 className="text-xl font-bold text-[#FF3333] tracking-widest uppercase">
          ACCESS DENIED // RBAC ENFORCEMENT
        </h2>
        <p className="text-xs font-mono text-[#A0A0A0] max-w-md mx-auto">
          Your active session (<code className="text-white">{account}</code>) holds <code className="text-[#77DD77]">{activeRole}</code> role.
          Admin Dashboard requires <code className="text-[#77DD77]">ADMIN_ROLE</code> or <code className="text-[#77DD77]">MANAGER_ROLE</code>.
        </p>
        <p className="text-xs font-mono text-[#77DD77]">
          TIP: Use the top right Persona Switcher to select 'SysAdmin Enclave' or 'Asset Officer'.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono">
      {/* Header Banner */}
      <div className="cyber-card bg-[#050505] border-2 border-[#77DD77] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#77DD77] text-xs font-bold">
            <ShieldAlert size={16} /> ADMIN ENCLAVE & ASSET MINTING SUITE
          </div>
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider mt-1">
            RBAC & DID Identity Management
          </h1>
        </div>
        <div className="text-right text-xs text-[#A0A0A0]">
          Active Role: <span className="text-[#77DD77] font-bold">[{activeRole}_ROLE]</span><br />
          Session: <span className="text-white">{account.substring(0, 8)}...{account.substring(38)}</span>
        </div>
      </div>

      {/* Grid of Action Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form 1: Register DID & Role */}
        <div className="cyber-card border border-[#77DD77] space-y-4">
          <div className="flex items-center gap-2 text-[#77DD77] font-bold border-b border-[#222] pb-2 text-sm">
            <UserPlus size={18} /> REGISTER DECENTRALIZED IDENTIFIER (DID)
          </div>

          {didSuccessMsg && (
            <div className="p-3 bg-[#0C2B17] border border-[#77DD77] text-[#77DD77] text-xs flex items-center gap-2">
              <CheckCircle size={16} /> {didSuccessMsg}
            </div>
          )}

          <form onSubmit={handleRegisterDID} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#A0A0A0] mb-1">TARGET WALLET ADDRESS *</label>
              <input
                type="text"
                placeholder="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
                value={didWallet}
                onChange={e => setDidWallet(e.target.value)}
                className="cyber-input"
                required
              />
            </div>

            <div>
              <label className="block text-[#A0A0A0] mb-1">IDENTITY / OPERATOR NAME *</label>
              <input
                type="text"
                placeholder="e.g. Commander Sarah Connor"
                value={didName}
                onChange={e => setDidName(e.target.value)}
                className="cyber-input"
                required
              />
            </div>

            <div>
              <label className="block text-[#A0A0A0] mb-1">PRIMARY RBAC ROLE *</label>
              <select
                value={didRole}
                onChange={e => setDidRole(e.target.value)}
                className="cyber-input bg-[#0A0A0A]"
              >
                <option value="USER">USER_ROLE (Standard Access)</option>
                <option value="MANAGER">MANAGER_ROLE (Asset Officer)</option>
                <option value="AUDITOR">AUDITOR_ROLE (Read-Only Auditor)</option>
                <option value="ADMIN">ADMIN_ROLE (System Administrator)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#A0A0A0] mb-1">IPFS METADATA PROOF URI (OPTIONAL)</label>
              <input
                type="text"
                placeholder="ipfs://bafkreididproof..."
                value={didIPFS}
                onChange={e => setDidIPFS(e.target.value)}
                className="cyber-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-xs py-3 mt-2"
            >
              {loading ? 'EXECUTING TRANSACTION...' : 'REGISTER DID ON SMART CONTRACT'}
            </button>
          </form>
        </div>

        {/* Form 2: Mint NFT Asset */}
        <div className="cyber-card border border-[#77DD77] space-y-4">
          <div className="flex items-center gap-2 text-[#77DD77] font-bold border-b border-[#222] pb-2 text-sm">
            <PlusCircle size={18} /> MINT TOKENIZED DIGITAL/PHYSICAL ASSET (NFT)
          </div>

          {nftSuccessMsg && (
            <div className="p-3 bg-[#0C2B17] border border-[#77DD77] text-[#77DD77] text-xs flex items-center gap-2">
              <CheckCircle size={16} /> {nftSuccessMsg}
            </div>
          )}

          <form onSubmit={handleMintNFT} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#A0A0A0] mb-1">RECIPIENT REGISTERED DID / WALLET *</label>
              <select
                value={nftRecipient}
                onChange={e => setNftRecipient(e.target.value)}
                className="cyber-input bg-[#0A0A0A]"
                required
              >
                <option value="">-- SELECT REGISTERED DID RECIPIENT --</option>
                {identities.map(i => (
                  <option key={i.walletAddress} value={i.walletAddress}>
                    {i.name} ({i.walletAddress.substring(0, 8)}...)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#A0A0A0] mb-1">ASSET NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. Master Security Key"
                  value={nftName}
                  onChange={e => setNftName(e.target.value)}
                  className="cyber-input"
                  required
                />
              </div>
              <div>
                <label className="block text-[#A0A0A0] mb-1">CATEGORY *</label>
                <select
                  value={nftCategory}
                  onChange={e => setNftCategory(e.target.value)}
                  className="cyber-input bg-[#0A0A0A]"
                >
                  <option value="Hardware Security Module">Hardware Security Key</option>
                  <option value="Access Credentials">Access Clearance Pass</option>
                  <option value="Physical Asset Token">Physical Vault Token</option>
                  <option value="License Token">Software License</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#A0A0A0] mb-1">SERIAL NUMBER / HARDWARE ID</label>
              <input
                type="text"
                placeholder="e.g. SN-89412-CYBER"
                value={nftSerial}
                onChange={e => setNftSerial(e.target.value)}
                className="cyber-input"
              />
            </div>

            <div>
              <label className="block text-[#A0A0A0] mb-1">ASSET DESCRIPTION</label>
              <input
                type="text"
                placeholder="High-assurance cryptographic enclave token..."
                value={nftDesc}
                onChange={e => setNftDesc(e.target.value)}
                className="cyber-input"
              />
            </div>

            <div className="flex items-center gap-2 p-2 border border-[#333] bg-[#0A0A0A]">
              <input
                type="checkbox"
                id="isLockedCheck"
                checked={nftIsLocked}
                onChange={e => setNftIsLocked(e.target.checked)}
                className="w-4 h-4 accent-[#77DD77]"
              />
              <label htmlFor="isLockedCheck" className="text-[#77DD77] font-bold cursor-pointer">
                SOULBOUND LOCK (NON-TRANSFERABLE UNTIL UNLOCKED BY ADMIN)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-xs py-3 mt-2"
            >
              {loading ? 'MINTING NFT ON CHAIN...' : 'MINT & ALLOCATE NFT TO DID'}
            </button>
          </form>
        </div>
      </div>

      {/* Section: Global Registered DIDs Table */}
      <div className="cyber-card border border-[#77DD77] space-y-4">
        <div className="flex justify-between items-center border-b border-[#222] pb-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key size={18} className="text-[#77DD77]" /> REGISTERED DECENTRALIZED IDENTITIES ({identities.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#333] text-[#A0A0A0] bg-[#0A0A0A]">
                <th className="p-3">NAME & OPERATOR</th>
                <th className="p-3">DECENTRALIZED ID (DID)</th>
                <th className="p-3">WALLET ADDRESS</th>
                <th className="p-3">ROLE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {identities.map(item => (
                <tr key={item.walletAddress} className="hover:bg-[#080808]">
                  <td className="p-3 font-bold text-white">{item.name}</td>
                  <td className="p-3 text-[#77DD77] font-mono text-[11px] truncate max-w-[200px]">
                    {item.did}
                  </td>
                  <td className="p-3 font-mono text-[#A0A0A0]">
                    {item.walletAddress.substring(0, 8)}...{item.walletAddress.substring(36)}
                  </td>
                  <td className="p-3">
                    <span className="cyber-badge">{item.assignedRole}</span>
                  </td>
                  <td className="p-3">
                    {item.isRevoked ? (
                      <span className="text-[#FF3333] font-bold">[REVOKED]</span>
                    ) : (
                      <span className="text-[#77DD77] font-bold">[ACTIVE]</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => inspectIPFS(item.metadataURI)}
                      className="px-2 py-1 bg-black border border-[#77DD77] text-[#77DD77] hover:bg-[#77DD77] hover:text-black transition-all text-[10px]"
                    >
                      PROOF
                    </button>

                    {activeRole === 'ADMIN' && !item.isRevoked && (
                      <button
                        onClick={() => revokeIdentity(item.walletAddress)}
                        className="px-2 py-1 bg-black border border-[#FF3333] text-[#FF3333] hover:bg-[#FF3333] hover:text-black transition-all text-[10px]"
                      >
                        REVOKE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: Global Asset Soulbound Lock Controls */}
      <div className="cyber-card border border-[#77DD77] space-y-4">
        <div className="flex justify-between items-center border-b border-[#222] pb-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock size={18} className="text-[#77DD77]" /> GLOBAL ASSET SOULBOUND LOCK CONTROLS ({assets.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#333] text-[#A0A0A0] bg-[#0A0A0A]">
                <th className="p-3">TOKEN ID</th>
                <th className="p-3">ASSET NAME</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">SERIAL NUMBER</th>
                <th className="p-3">OWNER DID</th>
                <th className="p-3">SOULBOUND LOCK STATUS</th>
                <th className="p-3 text-right">ADMIN CONTROL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {assets.map(asset => (
                <tr key={asset.tokenId} className="hover:bg-[#080808]">
                  <td className="p-3 font-bold text-[#77DD77]">#{asset.tokenId}</td>
                  <td className="p-3 font-bold text-white">{asset.name}</td>
                  <td className="p-3 text-[#A0A0A0]">{asset.assetType}</td>
                  <td className="p-3 font-mono text-[#77DD77]">{asset.serialNumber}</td>
                  <td className="p-3 font-mono text-[#A0A0A0] truncate max-w-[150px]">{asset.ownerDID}</td>
                  <td className="p-3">
                    {asset.isLocked ? (
                      <span className="bg-[#77DD77] text-black font-bold px-2 py-0.5 text-[10px] flex items-center gap-1 w-max border border-[#77DD77]">
                        <Lock size={10} /> SOULBOUND (LOCKED)
                      </span>
                    ) : (
                      <span className="bg-black text-[#77DD77] font-bold px-2 py-0.5 text-[10px] flex items-center gap-1 w-max border border-[#77DD77]">
                        <Unlock size={10} /> TRANSFERABLE
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {activeRole === 'ADMIN' && (
                      <button
                        onClick={() => toggleAssetLock(asset.tokenId, !asset.isLocked)}
                        className={`px-3 py-1 border font-bold text-[10px] transition-all flex items-center gap-1 ml-auto ${
                          asset.isLocked
                            ? 'bg-black text-[#77DD77] border-[#77DD77] hover:bg-[#77DD77] hover:text-black'
                            : 'bg-black text-[#FF3333] border-[#FF3333] hover:bg-[#FF3333] hover:text-black'
                        }`}
                      >
                        {asset.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                        {asset.isLocked ? 'UNLOCK ASSET' : 'LOCK SOULBOUND'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
