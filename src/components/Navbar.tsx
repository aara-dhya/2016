'use client';

import React, { useState } from 'react';
import { useWeb3, RoleType } from '../context/Web3Context';
import { Shield, ShieldCheck, UserCheck, Eye, ChevronDown, Cpu, LogIn, QrCode, Users, Webhook } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSSO: () => void;
  onOpenVerify: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSSO, onOpenVerify }) => {
  const { activePersona } = useWeb3();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="bg-black text-[#77DD77] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#77DD77]">
            <ShieldCheck size={12} /> ADMIN
          </span>
        );
      case 'MANAGER':
        return (
          <span className="bg-black text-[#61D095] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#61D095]">
            <UserCheck size={12} /> MANAGER
          </span>
        );
      case 'AUDITOR':
        return (
          <span className="bg-black text-[#FFD166] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#FFD166]">
            <Eye size={12} /> AUDITOR
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="bg-black text-[#A0A0A0] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#333333]">
            <Shield size={12} /> USER
          </span>
        );
    }
  };

  return (
    <header className="bg-black border-b border-[#222222] text-white sticky top-0 z-40 shadow-none font-mono select-none">
      {/* Top Telemetry Bar */}
      <div className="bg-black border-b border-[#222222] px-4 py-1.5 flex justify-between items-center text-xs text-[#A0A0A0] font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#77DD77] font-bold">
            <span className="w-2 h-2 rounded-none bg-[#77DD77] animate-pulse"></span> SECURITY ENCLAVE: ACTIVE
          </span>
          <span className="hidden sm:inline text-[#333333]">|</span>
          <span className="hidden sm:inline text-[#A0A0A0]">CHAIN ID: 31337</span>
        </div>
        <div className="flex items-center gap-3 text-[#A0A0A0] text-xs font-mono">
          <button
            onClick={onOpenVerify}
            className="hover:text-[#77DD77] flex items-center gap-1 transition-colors text-[#77DD77] font-bold"
          >
            <QrCode size={13} /> VERIFY SERIAL
          </button>
          <span className="text-[#333333]">|</span>
          <button
            onClick={onOpenSSO}
            className="hover:text-[#77DD77] flex items-center gap-1 transition-colors font-bold text-white"
          >
            <LogIn size={13} /> SSO SIGN IN
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77] group-hover:bg-[#77DD77] group-hover:text-black transition-colors">
            <Cpu size={22} />
          </div>
          <div>
            <div className="font-bold text-base text-white flex items-center gap-2 font-mono tracking-wider">
              NEXUS <span className="text-xs bg-black text-[#77DD77] font-mono px-2 py-0.5 border border-[#77DD77]">v2.0 BRUTALIST</span>
            </div>
            <div className="text-[10px] text-[#A0A0A0] font-mono">
              HR IDENTITY & IT ASSET MANAGER
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center gap-1 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-none transition-all ${
              activeTab === 'overview'
                ? 'bg-[#77DD77] text-black font-bold border border-[#77DD77]'
                : 'text-[#A0A0A0] hover:text-[#77DD77] hover:bg-[#111111]'
            }`}
          >
            DASHBOARD
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-none transition-all flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-[#77DD77] text-black font-bold border border-[#77DD77]'
                : 'text-[#A0A0A0] hover:text-[#77DD77] hover:bg-[#111111]'
            }`}
          >
            <Users size={14} /> DIRECTORY
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-1.5 rounded-none transition-all flex items-center gap-1.5 ${
              activeTab === 'webhooks'
                ? 'bg-[#77DD77] text-black font-bold border border-[#77DD77]'
                : 'text-[#A0A0A0] hover:text-[#77DD77] hover:bg-[#111111]'
            }`}
          >
            <Webhook size={14} /> RELAYER
          </button>

          <button
            onClick={() => setActiveTab('user')}
            className={`px-3 py-1.5 rounded-none transition-all ${
              activeTab === 'user'
                ? 'bg-[#77DD77] text-black font-bold border border-[#77DD77]'
                : 'text-[#A0A0A0] hover:text-[#77DD77] hover:bg-[#111111]'
            }`}
          >
            DIGITAL VAULT
          </button>

          <button
            onClick={() => setActiveTab('auditor')}
            className={`px-3 py-1.5 rounded-none transition-all ${
              activeTab === 'auditor'
                ? 'bg-[#77DD77] text-black font-bold border border-[#77DD77]'
                : 'text-[#A0A0A0] hover:text-[#77DD77] hover:bg-[#111111]'
            }`}
          >
            AUDIT LOG
          </button>
        </nav>

        {/* Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-black border border-[#77DD77] text-[#77DD77] px-3 py-1.5 rounded-none text-xs font-mono"
          >
            <LogIn size={14} />
            <span className="font-bold text-white">{activePersona.name.split(' ')[0]}</span>
            {getRoleBadge(activePersona.role)}
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-80 bg-black border-2 border-[#77DD77] shadow-[6px_6px_0px_#77DD77] z-50 p-2 text-xs font-mono">
              <div className="text-[10px] text-[#77DD77] font-bold uppercase px-3 py-2 border-b border-[#222222]">
                SESSION DETAILS
              </div>
              <div className="p-2.5">
                <div className="text-white">Active session is bound to this persona.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
