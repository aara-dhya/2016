'use client';

import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ShieldCheck, Lock, FileCode, Layers, ArrowRight, Cpu, Key, Activity, Database } from 'lucide-react';

interface LandingViewProps {
  setActiveTab: (tab: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ setActiveTab }) => {
  const { identities, assets, auditLogs } = useWeb3();

  const totalLocked = assets.filter(a => a.isLocked).length;

  return (
    <div className="space-y-8">
      {/* Hero Terminal Enclave Section */}
      <div className="cyber-card border-2 border-[#77DD77] relative overflow-hidden bg-black p-8">
        <div className="absolute top-0 right-0 p-4 text-[10px] text-[#A0A0A0] font-mono uppercase tracking-widest text-right">
          STATUS: ACTIVE<br />
          NODE: DECENTRALIZED_MAIN<br />
          VERSION: 1.0.0
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="inline-block bg-[#111] border border-[#77DD77] text-[#77DD77] px-3 py-1 text-xs font-bold font-mono">
            // TRUSTLESS IDENTITY & ACCESS ARCHITECTURE
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase">
            SECURE DECENTRALIZED <br />
            <span className="text-[#77DD77] underline decoration-4 underline-offset-8">IDENTITY & ASSETS</span>
          </h1>
          <p className="text-[#A0A0A0] text-sm md:text-base font-mono leading-relaxed">
            Eliminate centralized single points of failure. Manage W3C-compliant Decentralized Identifiers (DIDs), 
            enforce smart contract-based Role-Based Access Control (RBAC), and tokenize digital/physical assets 
            with cryptographic Soulbound lock protection.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 font-mono">
            <button
              onClick={() => setActiveTab('user')}
              className="btn-primary flex items-center gap-2"
            >
              EXPLORE MY VAULT <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="btn-secondary flex items-center gap-2"
            >
              ADMIN PANEL <Key size={16} />
            </button>
            <button
              onClick={() => setActiveTab('auditor')}
              className="btn-secondary text-[#A0A0A0] border-[#444] hover:border-[#77DD77] hover:text-[#77DD77] flex items-center gap-2"
            >
              VIEW AUDIT LOGS <Activity size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Live System Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="cyber-card p-4 border border-[#77DD77]">
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs">
            <span>REGISTERED DIDS</span>
            <ShieldCheck size={16} className="text-[#77DD77]" />
          </div>
          <div className="text-3xl font-extrabold text-[#77DD77] mt-2">{identities.length}</div>
          <div className="text-[10px] text-[#38A368] mt-1">Verified On-Chain</div>
        </div>

        <div className="cyber-card p-4 border border-[#77DD77]">
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs">
            <span>TOKENIZED ASSETS</span>
            <Layers size={16} className="text-[#77DD77]" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{assets.length}</div>
          <div className="text-[10px] text-[#38A368] mt-1">ERC721 Cryptographic Tokens</div>
        </div>

        <div className="cyber-card p-4 border border-[#77DD77]">
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs">
            <span>SOULBOUND LOCKED</span>
            <Lock size={16} className="text-[#77DD77]" />
          </div>
          <div className="text-3xl font-extrabold text-[#77DD77] mt-2">{totalLocked}</div>
          <div className="text-[10px] text-[#38A368] mt-1">Non-Transferable Credentials</div>
        </div>

        <div className="cyber-card p-4 border border-[#77DD77]">
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs">
            <span>AUDIT EVENTS</span>
            <Database size={16} className="text-[#77DD77]" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{auditLogs.length}</div>
          <div className="text-[10px] text-[#38A368] mt-1">Immutable Logs</div>
        </div>
      </div>

      {/* Core Architectural Pillars Section */}
      <div>
        <div className="text-xs font-mono text-[#77DD77] mb-2">// SYSTEM MODULES & SPECIFICATIONS</div>
        <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-white border-b border-[#222] pb-2">
          Platform Architecture Components
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module 1 */}
          <div className="cyber-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111] border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-bold text-base text-[#77DD77] uppercase">1. Decentralized Identifier (DID) Registry</h3>
            </div>
            <p className="text-xs text-[#A0A0A0] font-mono leading-relaxed">
              Maps wallet addresses to tamper-proof DIDs (<code className="text-[#77DD77]">did:cyber:...</code>). Encrypted identity proofs and credentials are store-pinned on IPFS with zero personal identifiable data on-chain.
            </p>
          </div>

          {/* Module 2 */}
          <div className="cyber-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111] border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
                <Key size={18} />
              </div>
              <h3 className="font-bold text-base text-[#77DD77] uppercase">2. On-Chain RBAC Governance</h3>
            </div>
            <p className="text-xs text-[#A0A0A0] font-mono leading-relaxed">
              Enforces strict Role-Based Access Control (<code className="text-[#77DD77]">ADMIN_ROLE</code>, <code className="text-[#77DD77]">MANAGER_ROLE</code>, <code className="text-[#77DD77]">AUDITOR_ROLE</code>, <code className="text-[#77DD77]">USER_ROLE</code>) via OpenZeppelin smart contract modifiers.
            </p>
          </div>

          {/* Module 3 */}
          <div className="cyber-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111] border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
                <Lock size={18} />
              </div>
              <h3 className="font-bold text-base text-[#77DD77] uppercase">3. Asset NFTs & Soulbound Locking</h3>
            </div>
            <p className="text-xs text-[#A0A0A0] font-mono leading-relaxed">
              Tokenizes digital and physical assets (Hardware Tokens, Passes, Vault Certificates) with custom serial metadata. Administrators can toggle Soulbound transfer locks directly on smart contracts.
            </p>
          </div>

          {/* Module 4 */}
          <div className="cyber-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111] border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
                <Activity size={18} />
              </div>
              <h3 className="font-bold text-base text-[#77DD77] uppercase">4. Immutable Audit Logger</h3>
            </div>
            <p className="text-xs text-[#A0A0A0] font-mono leading-relaxed">
              Centralized smart contract event log indexer emitting tamper-proof events for every single state mutation: identity registration, role changes, asset mints, and transfers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
