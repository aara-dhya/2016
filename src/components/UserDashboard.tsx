'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Shield, Key, Lock, Unlock, Send, ExternalLink, Cpu, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    account,
    activePersona,
    activeRole,
    identities,
    assets,
    transferAsset,
    inspectIPFS,
    loading
  } = useWeb3();

  const [transferRecipients, setTransferRecipients] = useState<{ [tokenId: number]: string }>({});
  const [transferMsg, setTransferMsg] = useState<{ [tokenId: number]: string }>({});

  const userIdentity = identities.find(
    i => i.walletAddress.toLowerCase() === account.toLowerCase()
  );

  const userAssets = assets.filter(
    a => a.ownerAddress.toLowerCase() === account.toLowerCase()
  );

  const handleRecipientChange = (tokenId: number, val: string) => {
    setTransferRecipients(prev => ({ ...prev, [tokenId]: val }));
  };

  const handleTransfer = async (tokenId: number) => {
    const recipient = transferRecipients[tokenId];
    if (!recipient) return;

    const success = await transferAsset(tokenId, recipient);
    if (success) {
      setTransferMsg(prev => ({
        ...prev,
        [tokenId]: `Successfully transferred Token #${tokenId} to ${recipient}!`
      }));
      setTransferRecipients(prev => ({ ...prev, [tokenId]: '' }));
      setTimeout(() => {
        setTransferMsg(prev => ({ ...prev, [tokenId]: '' }));
      }, 5000);
    } else {
      setTransferMsg(prev => ({
        ...prev,
        [tokenId]: `Transfer Reverted: Asset is Soulbound and locked.`
      }));
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* User Decentralized Identity Card */}
      <div className="cyber-card border-2 border-[#77DD77] bg-[#050505] p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black border-2 border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <Shield size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white uppercase">{activePersona.name}</h1>
                <span className="cyber-badge">{activeRole}_ROLE</span>
              </div>
              <div className="text-xs text-[#A0A0A0] mt-0.5">
                Session Wallet: <code className="text-[#77DD77]">{account}</code>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {userIdentity?.metadataURI && (
              <button
                onClick={() => inspectIPFS(userIdentity.metadataURI)}
                className="btn-secondary text-xs flex items-center gap-1 py-1.5 px-3"
              >
                <ExternalLink size={14} /> VIEW IPFS IDENTITY PROOF
              </button>
            )}
          </div>
        </div>

        {/* DID Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#0A0A0A] border border-[#222]">
            <span className="text-[#A0A0A0] block text-[10px] uppercase">Decentralized Identifier (DID)</span>
            <span className="text-[#77DD77] font-bold truncate block mt-1">
              {userIdentity ? userIdentity.did : activePersona.did}
            </span>
          </div>

          <div className="p-3 bg-[#0A0A0A] border border-[#222]">
            <span className="text-[#A0A0A0] block text-[10px] uppercase">Identity Registry Status</span>
            <span className="text-[#77DD77] font-bold block mt-1">
              {userIdentity?.isRevoked ? '[REVOKED]' : '[ACTIVE & VERIFIED ON-CHAIN]'}
            </span>
          </div>

          <div className="p-3 bg-[#0A0A0A] border border-[#222]">
            <span className="text-[#A0A0A0] block text-[10px] uppercase">Owned Assets Count</span>
            <span className="text-white font-bold block mt-1">
              {userAssets.length} Digital/Physical Assets
            </span>
          </div>
        </div>
      </div>

      {/* Owned Assets Inventory */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#222] pb-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={20} className="text-[#77DD77]" /> MY TOKENIZED ASSET VAULT ({userAssets.length})
          </h2>
          <div className="text-xs text-[#A0A0A0]">
            Displaying NFTs bound to DID: <span className="text-[#77DD77]">{activePersona.did.substring(0, 24)}...</span>
          </div>
        </div>

        {userAssets.length === 0 ? (
          <div className="cyber-card p-12 text-center text-[#A0A0A0] space-y-3">
            <Key size={36} className="mx-auto text-[#444]" />
            <div className="text-sm uppercase font-bold text-white">NO ASSETS ALLOCATED TO THIS DID YET</div>
            <p className="text-xs max-w-md mx-auto">
              Switch persona to 'SysAdmin Enclave' or 'Asset Officer' to mint and allocate hardware tokens, access passes, or vault certificates to this account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userAssets.map(asset => (
              <div
                key={asset.tokenId}
                className="cyber-card border-2 border-[#77DD77] flex flex-col justify-between space-y-4 p-6"
              >
                <div className="space-y-3">
                  {/* Top Badge Row */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-[#77DD77] bg-[#0A0A0A] border border-[#77DD77] px-2 py-0.5">
                      TOKEN #{asset.tokenId}
                    </span>

                    {asset.isLocked ? (
                      <span className="bg-[#77DD77] text-black font-extrabold px-2 py-0.5 text-[10px] flex items-center gap-1 border border-[#77DD77]">
                        <Lock size={12} /> SOULBOUND (LOCKED)
                      </span>
                    ) : (
                      <span className="bg-black text-[#77DD77] font-extrabold px-2 py-0.5 text-[10px] flex items-center gap-1 border border-[#77DD77]">
                        <Unlock size={12} /> TRANSFERABLE
                      </span>
                    )}
                  </div>

                  {/* Asset Title & Category */}
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase">{asset.name}</h3>
                    <div className="text-xs text-[#38A368] font-bold mt-0.5">{asset.assetType}</div>
                  </div>

                  <p className="text-xs text-[#A0A0A0] leading-relaxed">{asset.description}</p>

                  {/* Metadata Details */}
                  <div className="space-y-1 text-xs bg-[#0A0A0A] p-3 border border-[#222]">
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">SERIAL NUMBER:</span>
                      <span className="text-[#77DD77] font-bold">{asset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">OWNER DID:</span>
                      <span className="text-white truncate max-w-[180px]">{asset.ownerDID}</span>
                    </div>
                  </div>
                </div>

                {/* Transfer Section */}
                <div className="pt-2 border-t border-[#222]">
                  {transferMsg[asset.tokenId] && (
                    <div className={`p-2 mb-2 text-xs border ${
                      transferMsg[asset.tokenId].includes('Reverted')
                        ? 'border-[#FF3333] text-[#FF3333] bg-[#260A0A]'
                        : 'border-[#77DD77] text-[#77DD77] bg-[#0C2B17]'
                    }`}>
                      {transferMsg[asset.tokenId]}
                    </div>
                  )}

                  {asset.isLocked ? (
                    <div className="p-3 bg-[#0A0A0A] border border-[#444] text-[#A0A0A0] text-xs flex items-center gap-2">
                      <Lock size={14} className="text-[#77DD77]" />
                      <span>SOULBOUND ASSET - LOCKED BY ADMIN. TRANSFERS DISABLED ON SMART CONTRACT.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[10px] text-[#A0A0A0] uppercase font-bold">INITIATE ASSET TRANSFER</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Recipient wallet address (e.g. 0x99655...)"
                          value={transferRecipients[asset.tokenId] || ''}
                          onChange={e => handleRecipientChange(asset.tokenId, e.target.value)}
                          className="cyber-input text-xs py-1.5"
                        />
                        <button
                          onClick={() => handleTransfer(asset.tokenId)}
                          disabled={loading || !transferRecipients[asset.tokenId]}
                          className="btn-primary text-xs py-1 px-4 flex items-center gap-1 whitespace-nowrap"
                        >
                          <Send size={12} /> TRANSFER
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
