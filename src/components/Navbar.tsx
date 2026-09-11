'use client';

import React, { useState } from 'react';
import { useWeb3, DEMO_PERSONAS, RoleType } from '../context/Web3Context';
import { Shield, ShieldAlert, UserCheck, Eye, Terminal, ChevronDown, Cpu, Lock } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { activePersona, switchPersona, activeRole } = useWeb3();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="bg-[#77DD77] text-black font-extrabold px-2 py-0.5 text-xs tracking-wider flex items-center gap-1 border border-[#77DD77]">
            <ShieldAlert size={12} /> [ADMIN]
          </span>
        );
      case 'MANAGER':
        return (
          <span className="bg-[#38A368] text-white font-extrabold px-2 py-0.5 text-xs tracking-wider flex items-center gap-1 border border-[#77DD77]">
            <UserCheck size={12} /> [MANAGER]
          </span>
        );
      case 'AUDITOR':
        return (
          <span className="bg-[#111] text-[#77DD77] font-extrabold px-2 py-0.5 text-xs tracking-wider flex items-center gap-1 border border-[#77DD77]">
            <Eye size={12} /> [AUDITOR]
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="bg-black text-[#A0A0A0] font-bold px-2 py-0.5 text-xs tracking-wider flex items-center gap-1 border border-[#444]">
            <Shield size={12} /> [USER]
          </span>
        );
    }
  };

  return (
    <header className="bg-black border-b-2 border-[#77DD77] text-white sticky top-0 z-40">
      {/* Top Telemetry Bar */}
      <div className="bg-[#0A0A0A] border-b border-[#222] px-4 py-1 flex justify-between items-center text-[10px] text-[#A0A0A0] font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[#77DD77]">
            <span className="w-2 h-2 bg-[#77DD77] animate-pulse"></span> SYSTEM: ONLINE
          </span>
          <span>CHAIN_ID: 31337 (HARDHAT_LOCAL)</span>
          <span>SECURITY: ENFORCED (RBAC_V2)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>ENCRYPTION: AES-256-GCM</span>
          <span>IPFS: PINNED</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-black border-2 border-[#77DD77] flex items-center justify-center text-[#77DD77] group-hover:bg-[#77DD77] group-hover:text-black transition-all">
            <Cpu size={20} />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-wider text-[#77DD77] flex items-center gap-2">
              CYBER_ID <span className="text-xs bg-[#222] text-[#77DD77] px-1 border border-[#77DD77]">v1.0</span>
            </div>
            <div className="text-[10px] text-[#A0A0A0] uppercase tracking-widest">
              Decentralized Identity & Asset Enclave
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 border transition-all ${
              activeTab === 'overview'
                ? 'bg-[#77DD77] text-black border-[#77DD77]'
                : 'bg-black text-white border-[#333] hover:border-[#77DD77] hover:text-[#77DD77]'
            }`}
          >
            OVERVIEW
          </button>

          {(activeRole === 'ADMIN' || activeRole === 'MANAGER') && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 border transition-all flex items-center gap-1 ${
                activeTab === 'admin'
                  ? 'bg-[#77DD77] text-black border-[#77DD77]'
                  : 'bg-black text-[#77DD77] border-[#77DD77] hover:bg-[#77DD77] hover:text-black'
              }`}
            >
              <ShieldAlert size={14} /> ADMIN & MINTING
            </button>
          )}

          <button
            onClick={() => setActiveTab('user')}
            className={`px-3 py-2 border transition-all ${
              activeTab === 'user'
                ? 'bg-[#77DD77] text-black border-[#77DD77]'
                : 'bg-black text-white border-[#333] hover:border-[#77DD77] hover:text-[#77DD77]'
            }`}
          >
            MY VAULT & DIDS
          </button>

          <button
            onClick={() => setActiveTab('auditor')}
            className={`px-3 py-2 border transition-all ${
              activeTab === 'auditor'
                ? 'bg-[#77DD77] text-black border-[#77DD77]'
                : 'bg-black text-white border-[#333] hover:border-[#77DD77] hover:text-[#77DD77]'
            }`}
          >
            AUDIT TRAIL
          </button>
        </nav>

        {/* Persona & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            {getRoleBadge(activePersona.role)}
            <span className="hidden sm:inline font-mono">
              {activePersona.name.split(' ')[0]} ({activePersona.address.substring(0, 6)}...)
            </span>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-black border-2 border-[#77DD77] shadow-neon z-50 p-2">
              <div className="text-[10px] text-[#A0A0A0] uppercase px-2 py-1 border-b border-[#222] mb-1 font-bold">
                SELECT SIMULATED PERSONA / ROLE
              </div>
              {DEMO_PERSONAS.map(p => (
                <div
                  key={p.key}
                  onClick={() => {
                    switchPersona(p.key);
                    setDropdownOpen(false);
                  }}
                  className={`p-2 cursor-pointer border mb-1 transition-all text-xs ${
                    activePersona.key === p.key
                      ? 'bg-[#111] border-[#77DD77] text-[#77DD77]'
                      : 'bg-black border-[#222] text-white hover:border-[#77DD77]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{p.name}</span>
                    {getRoleBadge(p.role)}
                  </div>
                  <div className="text-[10px] text-[#A0A0A0] font-mono truncate">
                    {p.address}
                  </div>
                  <div className="text-[10px] text-[#38A368] mt-0.5">
                    {p.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
