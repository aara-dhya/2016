'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ShieldAlert, UserPlus, PlusCircle, Lock, Unlock, Key, CheckCircle, ShieldCheck, QrCode, UserCheck } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';

interface AdminDashboardProps {
  onOpenSSO?: () => void;
  onVerifyAsset?: (serialNumber: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenSSO, onVerifyAsset }) => {
  const {
    account,
    activeRole,
    identities,
    assets,
    registerIdentity,
    mintAsset,
    toggleAssetLock,
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
  const [selectedQRAsset, setSelectedQRAsset] = useState<any>(null);

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

    const finalSerial = nftSerial || `SN-${Math.floor(Math.random() * 89999 + 10000)}-CYBER`;
    const metadataURI = nftIPFS || `ipfs://bafkreibaseassetmeta${Date.now()}`;

    try {
      await fetch('/api/assets/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: nftRecipient,
          assetName: nftName,
          description: nftDesc,
          serialNumber: finalSerial,
          category: nftCategory,
          isLocked: nftIsLocked
        })
      });
    } catch (err) {
      console.warn('Backend relayer offline, using local context state');
    }

    const success = await mintAsset(
      nftRecipient,
      nftName,
      nftDesc,
      finalSerial,
      nftCategory,
      metadataURI,
      nftIsLocked
    );

    if (success) {
      setNftSuccessMsg(`Asset Credential '${nftName}' issued to ${nftRecipient}!`);
      setSelectedQRAsset({
        serialNumber: finalSerial,
        assetName: nftName,
        category: nftCategory
      });
      setNftName('');
      setNftDesc('');
      setNftSerial('');
      setNftIPFS('');
      setTimeout(() => setNftSuccessMsg(''), 5000);
    }
  };

  if (activeRole !== 'ADMIN' && activeRole !== 'MANAGER') {
    return (
      <div className="bg-black border-2 border-[#FF5555] rounded-none p-8 text-center space-y-4 shadow-[4px_4px_0px_#FF5555] font-mono">
        <ShieldAlert size={48} className="mx-auto text-[#FF5555]" />
        <h2 className="text-xl font-bold text-[#FF5555] tracking-widest uppercase">
          [ACCESS RESTRICTED // RBAC POLICY ENFORCEMENT]
        </h2>
        <p className="text-xs text-white max-w-md mx-auto leading-relaxed">
          Your current session (<code className="text-[#77DD77]">{account}</code>) holds <code className="text-white font-bold">{activeRole}</code> permissions.
          The Admin Portal requires <code className="text-[#77DD77]">ADMIN_ROLE</code> or <code className="text-[#77DD77]">MANAGER_ROLE</code>.
        </p>
        <p className="text-xs text-[#77DD77] font-bold">
          Tip: Use the session persona selector in the top navbar to switch to 'SysAdmin Enclave' or 'Asset Manager'.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono w-full">
      {/* Header Banner */}
      <div className="bg-black border border-[#77DD77] rounded-none p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[4px_4px_0px_#222222]">
        <div>
          <div className="flex items-center gap-2 text-[#77DD77] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={16} /> // ASSET REGISTRATION & PROVISIONING PORTAL
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-wider uppercase mt-1">
            IDENTITY PROVISIONING & ASSET ISSUANCE
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {onOpenSSO && (
            <button
              onClick={onOpenSSO}
              className="btn-primary text-xs font-bold"
            >
              <UserCheck size={14} />
              <span>FRICTIONLESS SSO ONBOARD</span>
            </button>
          )}
          <div className="text-right text-xs text-[#A0A0A0] border-l border-[#222222] pl-3">
            AUTHENTICATED ROLE: <span className="text-[#77DD77] font-bold">[{activeRole}_ROLE]</span><br />
            ACCOUNT: <span className="text-white">{account.substring(0, 8)}...</span>
          </div>
        </div>
      </div>

      {/* QR Code Sticker Preview Modal if selected */}
      {selectedQRAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <QRCodeGenerator
            serialNumber={selectedQRAsset.serialNumber}
            assetName={selectedQRAsset.assetName}
            category={selectedQRAsset.category}
            onClose={() => setSelectedQRAsset(null)}
          />
        </div>
      )}

      {/* Grid of Action Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form 1: Register DID & Role */}
        <div className="bg-black border border-[#77DD77] rounded-none p-6 space-y-4 shadow-[4px_4px_0px_#222222]">
          <div className="flex items-center gap-2 text-white font-bold border-b border-[#222222] pb-3 text-sm uppercase tracking-wider">
            <UserPlus size={18} className="text-[#77DD77]" /> PROVISION DECENTRALIZED IDENTITY (DID)
          </div>

          {didSuccessMsg && (
            <div className="p-3 bg-black border border-[#77DD77] text-[#77DD77] text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} /> {didSuccessMsg}
            </div>
          )}

          <form onSubmit={handleRegisterDID} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Account Identifier (Wallet Address) *</label>
              <input
                type="text"
                placeholder="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
                value={didWallet}
                onChange={e => setDidWallet(e.target.value)}
                className="cyber-input font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Corporate Operator / User Name *</label>
              <input
                type="text"
                placeholder="e.g. Sarah Connor (Senior Operator)"
                value={didName}
                onChange={e => setDidName(e.target.value)}
                className="cyber-input font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Assigned Governance Role *</label>
              <select
                value={didRole}
                onChange={e => setDidRole(e.target.value)}
                className="cyber-input bg-black font-mono"
              >
                <option value="USER">USER_ROLE (Standard Corporate User)</option>
                <option value="MANAGER">MANAGER_ROLE (Asset & Identity Officer)</option>
                <option value="AUDITOR">AUDITOR_ROLE (Read-Only Auditor)</option>
                <option value="ADMIN">ADMIN_ROLE (System Administrator)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Identity Proof URI (IPFS Hash Optional)</label>
              <input
                type="text"
                placeholder="ipfs://bafkreididproof..."
                value={didIPFS}
                onChange={e => setDidIPFS(e.target.value)}
                className="cyber-input font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-xs py-3 mt-2 font-bold"
            >
              {loading ? 'PROCESSING REGISTRATION...' : 'REGISTER DID ON ON-CHAIN REGISTRY'}
            </button>
          </form>
        </div>

        {/* Form 2: Register Asset / Issue Credential */}
        <div className="bg-black border border-[#77DD77] rounded-none p-6 space-y-4 shadow-[4px_4px_0px_#222222]">
          <div className="flex items-center gap-2 text-white font-bold border-b border-[#222222] pb-3 text-sm uppercase tracking-wider">
            <PlusCircle size={18} className="text-[#77DD77]" /> REGISTER DIGITAL ASSET & QR STICKER
          </div>

          {nftSuccessMsg && (
            <div className="p-3 bg-black border border-[#77DD77] text-[#77DD77] text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} /> {nftSuccessMsg}
            </div>
          )}

          <form onSubmit={handleMintNFT} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Recipient Employee / Wallet *</label>
              <input
                type="text"
                placeholder="email@nexus.corp or 0x..."
                value={nftRecipient}
                onChange={e => setNftRecipient(e.target.value)}
                className="cyber-input font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Titan Security Key v5"
                  value={nftName}
                  onChange={e => setNftName(e.target.value)}
                  className="cyber-input font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Category *</label>
                <select
                  value={nftCategory}
                  onChange={e => setNftCategory(e.target.value)}
                  className="cyber-input bg-black font-mono"
                >
                  <option value="Hardware Security Module">Hardware Security Key</option>
                  <option value="Access Credentials">Access Clearance Pass</option>
                  <option value="Physical Asset Token">Physical Vault Token</option>
                  <option value="License Token">Software License</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Serial Number / Hardware ID</label>
              <input
                type="text"
                placeholder="e.g. SN-TITAN-9012-CYBER"
                value={nftSerial}
                onChange={e => setNftSerial(e.target.value)}
                className="cyber-input font-mono"
              />
            </div>

            <div>
              <label className="block text-[#77DD77] mb-1.5 font-bold uppercase">Asset Description</label>
              <input
                type="text"
                placeholder="High-assurance cryptographic enclave credential token..."
                value={nftDesc}
                onChange={e => setNftDesc(e.target.value)}
                className="cyber-input font-mono"
              />
            </div>

            <div className="flex items-center gap-2.5 p-3 border border-[#333333] bg-black">
              <input
                type="checkbox"
                id="isLockedCheck"
                checked={nftIsLocked}
                onChange={e => setNftIsLocked(e.target.checked)}
                className="w-4 h-4 rounded-none accent-[#77DD77]"
              />
              <label htmlFor="isLockedCheck" className="text-[#77DD77] font-bold cursor-pointer uppercase text-[11px]">
                SOULBOUND LOCK (NON-TRANSFERABLE POLICY)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-xs py-3 mt-2 font-bold"
            >
              {loading ? 'ISSUING CREDENTIAL...' : 'REGISTER ASSET & GENERATE QR STICKER'}
            </button>
          </form>
        </div>
      </div>

      {/* Section: Global Registered DIDs Table */}
      <div className="bg-black border border-[#77DD77] rounded-none p-6 space-y-4 shadow-[4px_4px_0px_#222222]">
        <div className="flex justify-between items-center border-b border-[#222222] pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Key size={18} className="text-[#77DD77]" /> REGISTERED DECENTRALIZED IDENTITIES ({identities.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222222] text-[#77DD77] bg-black font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Operator Name</th>
                <th className="p-3">Decentralized Identifier (DID)</th>
                <th className="p-3">Account Identifier</th>
                <th className="p-3">Governance Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] font-mono">
              {identities.map(item => (
                <tr key={item.walletAddress} className="hover:bg-[#111111] transition-colors">
                  <td className="p-3 font-bold text-white">{item.name}</td>
                  <td className="p-3 text-[#77DD77] font-mono text-xs truncate max-w-[220px]">
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
                      <span className="text-[#FF5555] font-bold">[REVOKED]</span>
                    ) : (
                      <span className="text-[#77DD77] font-bold">[ACTIVE]</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => inspectIPFS(item.metadataURI)}
                      className="btn-secondary py-1 px-3 text-[11px]"
                    >
                      PROOF PAYLOAD
                    </button>

                    {activeRole === 'ADMIN' && !item.isRevoked && (
                      <button
                        onClick={() => revokeIdentity(item.walletAddress)}
                        className="btn-danger py-1 px-3 text-[11px]"
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

      {/* Section: Global Asset Lock Policy Controls & QR Labels */}
      <div className="bg-black border border-[#77DD77] rounded-none p-6 space-y-4 shadow-[4px_4px_0px_#222222]">
        <div className="flex justify-between items-center border-b border-[#222222] pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Lock size={18} className="text-[#77DD77]" /> PHYSICAL EQUIPMENT & SOULBOUND CONTROLS ({assets.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222222] text-[#77DD77] bg-black font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Registry ID</th>
                <th className="p-3">Asset Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Serial Number</th>
                <th className="p-3">Owner DID</th>
                <th className="p-3">Policy Lock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] font-mono">
              {assets.map(asset => (
                <tr key={asset.tokenId} className="hover:bg-[#111111] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#77DD77]">#{asset.tokenId}</td>
                  <td className="p-3 font-bold text-white">{asset.name}</td>
                  <td className="p-3 text-[#A0A0A0]">{asset.assetType}</td>
                  <td className="p-3 font-mono text-[#77DD77]">{asset.serialNumber}</td>
                  <td className="p-3 font-mono text-[#A0A0A0] truncate max-w-[160px]">{asset.ownerDID}</td>
                  <td className="p-3 font-mono">
                    {asset.isLocked ? (
                      <span className="bg-black text-[#77DD77] font-bold px-2.5 py-1 rounded-none text-[10px] flex items-center gap-1.5 w-max border border-[#77DD77]">
                        <Lock size={11} /> SOULBOUND
                      </span>
                    ) : (
                      <span className="bg-black text-white font-bold px-2.5 py-1 rounded-none text-[10px] flex items-center gap-1.5 w-max border border-[#333333]">
                        <Unlock size={11} /> TRANSFERABLE
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono space-x-2">
                    <button
                      onClick={() => setSelectedQRAsset({ serialNumber: asset.serialNumber, assetName: asset.name, category: asset.assetType })}
                      className="btn-secondary py-1 px-2.5 text-[10px] inline-flex items-center gap-1"
                    >
                      <QrCode size={11} /> QR STICKER
                    </button>

                    {onVerifyAsset && (
                      <button
                        onClick={() => onVerifyAsset(asset.serialNumber)}
                        className="btn-secondary py-1 px-2.5 text-[10px] inline-flex items-center gap-1"
                      >
                        VERIFY
                      </button>
                    )}

                    {activeRole === 'ADMIN' && (
                      <button
                        onClick={() => toggleAssetLock(asset.tokenId, !asset.isLocked)}
                        className="btn-secondary py-1 px-2.5 text-[10px] inline-flex items-center gap-1"
                      >
                        {asset.isLocked ? <Unlock size={11} /> : <Lock size={11} />}
                        {asset.isLocked ? 'UNLOCK' : 'LOCK'}
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
