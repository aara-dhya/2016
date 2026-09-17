'use client';

import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Users, Layers, Lock, Activity, ArrowRight, ShieldCheck, QrCode, Webhook } from 'lucide-react';

interface LandingViewProps {
  setActiveTab: (tab: string) => void;
  onOpenSSO?: () => void;
  onOpenVerify?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ setActiveTab, onOpenSSO, onOpenVerify }) => {
  const { identities, assets, auditLogs, activePersona } = useWeb3();

  const totalLocked = assets.filter(a => a.isLocked).length;

  return (
    <div className="space-y-8 font-mono w-full py-2">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#222222] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-none bg-[#77DD77] animate-pulse" />
            <span className="text-xs text-[#A0A0A0] font-mono uppercase tracking-wider">SESSION: {activePersona.name}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-wider mt-1 uppercase">
            ENTERPRISE SECURITY DASHBOARD
          </h1>
          <p className="text-xs text-[#A0A0A0] mt-0.5 font-mono">
            Active DIDs, hardware credentials, and Web2 API relay telemetry.
          </p>
        </div>

        <div className="flex space-x-3">
          {onOpenVerify && (
            <button
              onClick={onOpenVerify}
              className="btn-secondary text-xs font-mono font-bold"
            >
              <QrCode className="w-4 h-4" />
              <span>VERIFY SERIAL</span>
            </button>
          )}
          {onOpenSSO && (
            <button
              onClick={onOpenSSO}
              className="btn-primary text-xs font-mono font-bold"
            >
              <span>PROVISION USER</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Top-Level Metric Cards (Section 1: The Empty Room Concept with Sharp Edges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div
          onClick={() => setActiveTab('directory')}
          className="bg-black border border-[#77DD77] p-5 shadow-[4px_4px_0px_#222222] hover:shadow-[4px_4px_0px_#77DD77] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs font-bold uppercase tracking-wider">
            <span>Active Personnel</span>
            <Users className="w-4 h-4 text-[#77DD77] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">{identities.length}</div>
          <div className="text-[11px] text-[#77DD77] font-bold mt-1 uppercase tracking-wider">Verified DIDs</div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setActiveTab('user')}
          className="bg-black border border-[#77DD77] p-5 shadow-[4px_4px_0px_#222222] hover:shadow-[4px_4px_0px_#77DD77] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs font-bold uppercase tracking-wider">
            <span>Assets Secured</span>
            <Layers className="w-4 h-4 text-[#77DD77] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">{assets.length}</div>
          <div className="text-[11px] text-[#77DD77] font-bold mt-1 uppercase tracking-wider">IT Credentials & Keys</div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActiveTab('user')}
          className="bg-black border border-[#77DD77] p-5 shadow-[4px_4px_0px_#222222] hover:shadow-[4px_4px_0px_#77DD77] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs font-bold uppercase tracking-wider">
            <span>Soulbound Credentials</span>
            <Lock className="w-4 h-4 text-[#77DD77] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">{totalLocked}</div>
          <div className="text-[11px] text-[#77DD77] font-bold mt-1 uppercase tracking-wider">Non-Transferable Locked</div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => setActiveTab('auditor')}
          className="bg-black border border-[#77DD77] p-5 shadow-[4px_4px_0px_#222222] hover:shadow-[4px_4px_0px_#77DD77] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center text-[#A0A0A0] text-xs font-bold uppercase tracking-wider">
            <span>Compliance Events</span>
            <Activity className="w-4 h-4 text-[#77DD77] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3 font-mono">{auditLogs.length}</div>
          <div className="text-[11px] text-[#77DD77] font-bold mt-1 uppercase tracking-wider">Audit Trail Log Records</div>
        </div>
      </div>

      {/* Intentionally Clean Terminal Layout with Direct Module Access */}
      <div className="pt-6">
        <div className="text-xs font-bold text-[#77DD77] uppercase tracking-widest mb-4">
          // SYSTEM MODULE DIRECT ACCESS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setActiveTab('directory')}
            className="bg-black border border-[#222222] hover:border-[#77DD77] p-6 hover:shadow-[4px_4px_0px_#77DD77] transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-extrabold text-white group-hover:text-[#77DD77] transition-colors flex items-center justify-between uppercase tracking-wider">
              <span>Employee Directory & DIDs</span>
              <ArrowRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#77DD77] group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed font-mono">
              Manage corporate personnel identity records, Decentralized Identifiers (DIDs), and custodial smart wallet bindings.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('user')}
            className="bg-black border border-[#222222] hover:border-[#77DD77] p-6 hover:shadow-[4px_4px_0px_#77DD77] transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-extrabold text-white group-hover:text-[#77DD77] transition-colors flex items-center justify-between uppercase tracking-wider">
              <span>Digital Asset Credentials</span>
              <ArrowRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#77DD77] group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed font-mono">
              Inspect hardware security key tokens, physical vault passes, and printable QR verification stickers.
            </p>
          </div>

          <div
            onClick={() => setActiveTab('webhooks')}
            className="bg-black border border-[#222222] hover:border-[#77DD77] p-6 hover:shadow-[4px_4px_0px_#77DD77] transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <Webhook className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-extrabold text-white group-hover:text-[#77DD77] transition-colors flex items-center justify-between uppercase tracking-wider">
              <span>Web2 Webhook Relayer</span>
              <ArrowRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#77DD77] group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed font-mono">
              Monitor real-time synchronization between smart contract role updates, GitHub repo access, and Kisi door access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
