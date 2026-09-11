'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Shield, Lock, Unlock, Send, ExternalLink, Layers, FolderOpen, QrCode, CheckCircle2 } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';

interface UserDashboardProps {
  onVerifyAsset?: (serialNumber: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onVerifyAsset }) => {
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
  const [selectedQRAsset, setSelectedQRAsset] = useState<any>(null);

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
        [tokenId]: `Successfully transferred Asset #${tokenId} to ${recipient}!`
      }));
      setTransferRecipients(prev => ({ ...prev, [tokenId]: '' }));
      setTimeout(() => {
        setTransferMsg(prev => ({ ...prev, [tokenId]: '' }));
      }, 5000);
    } else {
      setTransferMsg(prev => ({
        ...prev,
        [tokenId]: `Transfer Reverted: Asset policy is Soulbound and locked.`
      }));
    }
  };

  return (
    <div className="space-y-8 font-mono w-full">
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

      {/* User Decentralized Identity Card */}
      <div className="bg-black border border-[#77DD77] rounded-none p-6 space-y-6 shadow-[4px_4px_0px_#222222]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222222] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <Shield size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-white uppercase">{activePersona.name}</h1>
                <span className="cyber-badge">{activeRole}_ROLE</span>
              </div>
              <div className="text-xs text-[#A0A0A0] mt-1 font-mono">
                ACCOUNT: <code className="text-[#77DD77]">{account}</code>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {userIdentity?.metadataURI && (
              <button
                onClick={() => inspectIPFS(userIdentity.metadataURI)}
                className="btn-secondary text-xs font-bold"
              >
                <ExternalLink size={14} /> PROOF PAYLOAD
              </button>
            )}
          </div>
        </div>

        {/* DID Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-black rounded-none border border-[#222222]">
            <span className="text-[#A0A0A0] block text-[10px] uppercase font-bold">// DECENTRALIZED IDENTIFIER (DID)</span>
            <span className="font-mono text-[#77DD77] font-bold truncate block mt-1 text-xs">
              {userIdentity ? userIdentity.did : activePersona.did}
            </span>
          </div>

          <div className="p-4 bg-black rounded-none border border-[#222222]">
            <span className="text-[#A0A0A0] block text-[10px] uppercase font-bold">// REGISTRY STATUS</span>
            <span className="text-[#77DD77] font-bold block mt-1 text-xs">
              {userIdentity?.isRevoked ? '[REVOKED]' : '[ACTIVE & VERIFIED ON-CHAIN]'}
            </span>
          </div>

          <div className="p-4 bg-black rounded-none border border-[#222222]">
            <span className="text-[#A0A0A0] block text-[10px] uppercase font-bold">// CREDENTIALS HELD</span>
            <span className="text-white font-bold block mt-1 text-xs">
              {userAssets.length} CREDENTIALS SECURED
            </span>
          </div>
        </div>
      </div>

      {/* Owned Assets Inventory */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#222222] pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Layers size={20} className="text-[#77DD77]" /> DIGITAL ASSET CREDENTIALS VAULT ({userAssets.length})
          </h2>
          <div className="text-xs text-[#A0A0A0] font-mono">
            DID: <span className="text-[#77DD77]">{activePersona.did.substring(0, 26)}...</span>
          </div>
        </div>

        {userAssets.length === 0 ? (
          /* Empty State Graphic */
          <div className="bg-black border border-[#222222] rounded-none p-12 text-center text-[#A0A0A0] space-y-4 shadow-[4px_4px_0px_#222222] font-mono">
            <div className="w-16 h-16 rounded-none bg-black border border-[#77DD77] flex items-center justify-center mx-auto text-[#77DD77]">
              <FolderOpen size={32} />
            </div>
            <div className="text-base font-bold text-white uppercase">[NO ASSET CREDENTIALS ISSUED YET]</div>
            <p className="text-xs text-[#A0A0A0] max-w-md mx-auto leading-relaxed">
              No digital credentials or hardware keys are currently registered under this account identifier. Switch session to 'Asset Manager' to issue new credentials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userAssets.map(asset => (
              <div
                key={asset.tokenId}
                className="bg-black border border-[#77DD77] rounded-none flex flex-col justify-between space-y-5 p-6 shadow-[4px_4px_0px_#222222] hover:shadow-[4px_4px_0px_#77DD77] transition-all font-mono"
              >
                <div className="space-y-3.5">
                  {/* Top Badge Row */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-mono font-bold text-[#77DD77] bg-black border border-[#77DD77] px-2.5 py-1">
                      ID #{asset.tokenId}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQRAsset({ serialNumber: asset.serialNumber, assetName: asset.name, category: asset.assetType })}
                        className="btn-secondary py-0.5 px-2 text-[10px] font-bold"
                      >
                        <QrCode size={12} /> STICKER
                      </button>

                      {onVerifyAsset && (
                        <button
                          onClick={() => onVerifyAsset(asset.serialNumber)}
                          className="btn-secondary py-0.5 px-2 text-[10px] font-bold"
                        >
                          <CheckCircle2 size={12} /> VERIFY
                        </button>
                      )}

                      {asset.isLocked ? (
                        <span className="bg-black text-[#77DD77] font-bold px-2 py-0.5 text-[10px] flex items-center gap-1 border border-[#77DD77]">
                          <Lock size={11} /> SOULBOUND
                        </span>
                      ) : (
                        <span className="bg-black text-white font-bold px-2 py-0.5 text-[10px] flex items-center gap-1 border border-[#333333]">
                          <Unlock size={11} /> TRANSFERABLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Asset Title & Category */}
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase">{asset.name}</h3>
                    <div className="text-xs text-[#77DD77] font-bold mt-0.5 uppercase">{asset.assetType}</div>
                  </div>

                  <p className="text-xs text-[#A0A0A0] leading-relaxed font-mono">{asset.description}</p>

                  {/* Metadata Details */}
                  <div className="space-y-1.5 text-xs bg-black p-3.5 border border-[#222222]">
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0] font-bold uppercase">// SERIAL:</span>
                      <span className="font-mono text-[#77DD77] font-bold">{asset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0] font-bold uppercase">// OWNER DID:</span>
                      <span className="font-mono text-white truncate max-w-[190px]">{asset.ownerDID}</span>
                    </div>
                  </div>
                </div>

                {/* Transfer Section */}
                <div className="pt-3 border-t border-[#222222]">
                  {transferMsg[asset.tokenId] && (
                    <div className={`p-2.5 mb-3 text-xs border font-bold ${
                      transferMsg[asset.tokenId].includes('Reverted')
                        ? 'border-[#FF5555] text-[#FF5555] bg-black'
                        : 'border-[#77DD77] text-[#77DD77] bg-black'
                    }`}>
                      {transferMsg[asset.tokenId]}
                    </div>
                  )}

                  {asset.isLocked ? (
                    <div className="p-3 bg-black border border-[#333333] text-[#A0A0A0] text-[11px] flex items-center gap-2.5 font-mono">
                      <Lock size={16} className="text-[#77DD77] shrink-0" />
                      <span>[SOULBOUND POLICY ENFORCED: NON-TRANSFERABLE CREDENTIAL LOCKED]</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-[#77DD77] font-bold uppercase">// INITIATE TRANSFER</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Recipient Wallet Address (0x...)"
                          value={transferRecipients[asset.tokenId] || ''}
                          onChange={e => handleRecipientChange(asset.tokenId, e.target.value)}
                          className="cyber-input text-xs font-mono"
                        />
                        <button
                          onClick={() => handleTransfer(asset.tokenId)}
                          disabled={loading || !transferRecipients[asset.tokenId]}
                          className="btn-primary text-xs py-2 px-4 font-bold"
                        >
                          <Send size={14} /> TRANSFER
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
