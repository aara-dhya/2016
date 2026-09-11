'use client';

import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { X, Database, CheckCircle, Copy, ExternalLink } from 'lucide-react';

export const IPFSModal: React.FC = () => {
  const { selectedIPFSURI, closeIPFSModal } = useWeb3();

  if (!selectedIPFSURI) return null;

  const mockPayload = {
    ipfsHash: selectedIPFSURI,
    gatewayURL: `https://ipfs.io/ipfs/${selectedIPFSURI.replace('ipfs://', '')}`,
    storageStatus: 'PINNED_DECENTRALIZED',
    schemaVersion: 'W3C-DID-v1.0 / ERC721-Metadata',
    cryptographicProof: {
      algorithm: 'ECDSA_secp256k1',
      hashType: 'keccak256',
      signature: '0x94fa108920194812a4b89012fca12093810293841029384102938410923841029384'
    },
    attributes: [
      { trait_type: 'Security Standard', value: 'FIDO2 / PKCS#11' },
      { trait_type: 'Decentralized Storage', value: 'IPFS + Filecoin' },
      { trait_type: 'Audit Clearance', value: 'VERIFIED' }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="cyber-card border-2 border-[#77DD77] bg-black max-w-2xl w-full p-6 space-y-4 shadow-neon">
        <div className="flex justify-between items-center border-b border-[#222] pb-3">
          <div className="flex items-center gap-2 text-[#77DD77] font-bold text-sm">
            <Database size={18} /> DECENTRALIZED IPFS METADATA INSPECTOR
          </div>
          <button
            onClick={closeIPFSModal}
            className="p-1 hover:bg-[#77DD77] hover:text-black border border-[#77DD77] text-[#77DD77] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="text-xs text-[#A0A0A0] space-y-1">
          <div>
            URI: <code className="text-[#77DD77] font-bold">{selectedIPFSURI}</code>
          </div>
          <div>
            Status: <span className="text-[#77DD77] font-bold">[PINNED ON DECENTRALIZED NETWORK]</span>
          </div>
        </div>

        {/* JSON Display Box */}
        <div className="bg-[#050505] border border-[#333] p-4 font-mono text-xs text-[#77DD77] max-h-80 overflow-y-auto">
          <pre>{JSON.stringify(mockPayload, null, 2)}</pre>
        </div>

        <div className="flex justify-between items-center pt-2 text-xs">
          <span className="text-[10px] text-[#38A368]">
            CONTENT-ADDRESSABLE HASH GUARANTEES IMMUTABILITY
          </span>
          <button
            onClick={closeIPFSModal}
            className="btn-primary py-1.5 px-4 text-xs"
          >
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
};
