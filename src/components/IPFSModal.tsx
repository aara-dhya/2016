'use client';

import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { X, ShieldCheck, Copy } from 'lucide-react';

export const IPFSModal: React.FC = () => {
  const { selectedIPFSURI, closeIPFSModal } = useWeb3();

  if (!selectedIPFSURI) return null;

  const mockPayload = {
    identityProof: {
      type: 'VerifiableCredential',
      issuer: 'did:nexus:enclave:0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        ipfsURI: selectedIPFSURI,
        verificationMethod: 'Ed25519Signature2020',
        proofPurpose: 'assertionMethod',
        proofValue: '0x94829bf8293c84029482938402938409283409'
      }
    },
    securityPolicy: 'AES-256-GCM Encrypted Enclave Payload'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(mockPayload, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-mono select-none animate-fade-in">
      <div className="bg-black border-2 border-[#77DD77] rounded-none max-w-2xl w-full p-6 space-y-4 shadow-[8px_8px_0px_#77DD77] relative text-white">
        <div className="flex justify-between items-center border-b border-[#222222] pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-[#77DD77]" />
            <h3 className="font-extrabold text-sm text-[#77DD77] uppercase tracking-wider">// ENCRYPTED IPFS PROOF PAYLOAD</h3>
          </div>
          <button
            onClick={closeIPFSModal}
            className="text-[#A0A0A0] hover:text-[#77DD77] p-1 rounded-none hover:bg-[#111111] transition-colors border border-transparent hover:border-[#77DD77]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A0A0A0] font-bold uppercase">// TARGET HASH:</span>
            <code className="text-[#77DD77] font-mono text-[11px]">{selectedIPFSURI}</code>
          </div>

          <div className="bg-black p-4 border border-[#333333] text-xs font-mono text-[#77DD77] overflow-x-auto max-h-80 selection:bg-[#77DD77] selection:text-black">
            <pre>{JSON.stringify(mockPayload, null, 2)}</pre>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs font-bold"
          >
            <Copy size={14} /> COPY JSON PAYLOAD
          </button>
          <button
            onClick={closeIPFSModal}
            className="btn-primary text-xs font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
