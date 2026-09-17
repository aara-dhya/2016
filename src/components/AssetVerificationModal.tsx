'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { QrCode, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AssetVerificationModalProps {
  isOpen: boolean;
  initialSerialNumber?: string;
  onClose: () => void;
}

export const AssetVerificationModal: React.FC<AssetVerificationModalProps> = ({
  isOpen,
  initialSerialNumber = '',
  onClose
}) => {
  const { addTerminalLog } = useWeb3();
  const [serialNumber, setSerialNumber] = useState(initialSerialNumber);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialSerialNumber) {
      setSerialNumber(initialSerialNumber);
      handleVerify(initialSerialNumber);
    } else {
      setVerificationResult(null);
      setErrorMsg(null);
    }
  }, [initialSerialNumber, isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (snToVerify?: string) => {
    const targetSN = snToVerify || serialNumber;
    if (!targetSN.trim()) return;

    setIsVerifying(true);
    setErrorMsg(null);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/assets/verify/${encodeURIComponent(targetSN.trim())}`);
      const data = await res.json();

      if (res.ok && data.verified) {
        setVerificationResult(data);
        addTerminalLog(`[ASSET VERIFICATION] Serial '${targetSN}' verified on-chain. Owner: ${data.asset.ownerEmail}`);
      } else {
        setErrorMsg(data.error || `Serial Number '${targetSN}' not recognized on system registry.`);
        addTerminalLog(`[VERIFICATION FAILED] Serial '${targetSN}' lookup failed.`);
      }
    } catch (err: any) {
      setErrorMsg(`Verification service error: ${err.message || 'Unable to connect to verification relayer'}`);
      addTerminalLog(`[VERIFICATION ERROR] Express backend connection failed.`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-mono select-none animate-fade-in">
      <div className="bg-black border-2 border-[#77DD77] rounded-none shadow-[8px_8px_0px_#77DD77] max-w-lg w-full p-6 text-white relative">
        <div className="flex items-center justify-between mb-5 border-b border-[#222222] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#77DD77] uppercase tracking-wider">EQUIPMENT SERIAL VERIFICATION</h3>
              <p className="text-[10px] text-[#A0A0A0]">// PHYSICAL-TO-DIGITAL REGISTRY BRIDGE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A0A0A0] hover:text-[#77DD77] p-1 rounded-none hover:bg-[#111111] transition-colors border border-transparent hover:border-[#77DD77]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="flex space-x-2 mb-6">
          <input
            type="text"
            value={serialNumber}
            onChange={e => setSerialNumber(e.target.value)}
            placeholder="Enter Serial Number (e.g., SN-TITAN-9012-CYBER)"
            className="cyber-input text-xs font-mono"
          />
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying}
            className="btn-primary text-xs font-bold whitespace-nowrap"
          >
            {isVerifying ? <span>VERIFYING...</span> : <span>VERIFY</span>}
          </button>
        </div>

        {/* Error View */}
        {errorMsg && (
          <div className="p-4 bg-black border-2 border-[#FF5555] rounded-none text-[#FF5555] text-xs space-y-1 mb-4 font-mono">
            <div className="font-bold uppercase flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>// VERIFICATION FAILED</span>
            </div>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Verification Success Result Card */}
        {verificationResult && (
          <div className="bg-black border-2 border-[#77DD77] rounded-none p-4 space-y-4 font-mono shadow-[4px_4px_0px_#77DD77]">
            {/* Status Badge */}
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-none bg-[#77DD77] animate-ping" />
                <span className="text-xs font-extrabold text-[#77DD77] tracking-wider uppercase">[VERIFIED ON-CHAIN]</span>
              </div>
              <span className="text-[10px] text-[#A0A0A0] font-mono">
                BLOCK #{verificationResult.proofOfOwnership.blockConfirmation}
              </span>
            </div>

            {/* Asset Metadata */}
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider block">// ASSET TITLE:</span>
                <p className="text-sm font-extrabold text-white uppercase">{verificationResult.asset.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider block">// SERIAL:</span>
                  <code className="text-[#77DD77] font-mono font-bold">{verificationResult.asset.serialNumber}</code>
                </div>
                <div>
                  <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider block">// CATEGORY:</span>
                  <span className="text-white">{verificationResult.asset.assetType}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider block">// VERIFIED OWNER:</span>
                <p className="text-xs text-white font-bold">{verificationResult.ownerDetails.name} ({verificationResult.asset.ownerEmail})</p>
                <code className="text-[10px] text-[#77DD77] font-mono break-all block mt-0.5">{verificationResult.asset.ownerDID}</code>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#222222]">
                <div>
                  <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider block">// SOULBOUND POLICY:</span>
                  <span className={`inline-block px-2 py-0.5 rounded-none text-[10px] font-bold mt-0.5 border ${
                    verificationResult.asset.isLocked 
                      ? 'bg-black text-[#77DD77] border-[#77DD77]' 
                      : 'bg-black text-white border-[#333333]'
                  }`}>
                    {verificationResult.asset.isLocked ? '[LOCKED SOULBOUND]' : '[TRANSFERABLE]'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider block">// WARRANTY EXPIRY:</span>
                  <span className="text-white font-mono mt-0.5 block">{verificationResult.asset.warrantyExpiry || '2028-12-31'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary text-xs font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
