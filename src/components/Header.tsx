'use client';

import React, { useState } from 'react';
import { useWeb3, DEMO_PERSONAS, RoleType } from '../context/Web3Context';
import { Shield, ShieldCheck, UserCheck, Eye, ChevronDown, QrCode, LogIn, PanelLeft } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onOpenSSO: () => void;
  onOpenVerify: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  onOpenSSO,
  onOpenVerify,
  onLogout
}) => {
  const { activePersona, switchPersona } = useWeb3();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'ENTERPRISE DASHBOARD';
      case 'directory':
        return 'EMPLOYEE HR DIRECTORY & DIDS';
      case 'user':
        return 'ASSET CREDENTIALS VAULT';
      case 'webhooks':
        return 'WEB2 API WEBHOOK RELAYER';
      case 'admin':
        return 'ASSET REGISTRATION & RBAC GOVERNANCE';
      case 'auditor':
        return 'COMPLIANCE LEDGER & AUDIT LOGS';
      default:
        return 'NEXUS SECURITY ENCLAVE';
    }
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="bg-black text-[#77DD77] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#77DD77]">
            <ShieldCheck size={11} /> ADMIN
          </span>
        );
      case 'MANAGER':
        return (
          <span className="bg-black text-[#61D095] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#61D095]">
            <UserCheck size={11} /> MANAGER
          </span>
        );
      case 'AUDITOR':
        return (
          <span className="bg-black text-[#FFD166] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#FFD166]">
            <Eye size={11} /> AUDITOR
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="bg-black text-[#A0A0A0] font-bold px-2 py-0.5 rounded-none text-[10px] flex items-center gap-1 border border-[#333333]">
            <Shield size={11} /> USER
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-black border-b border-[#222222] px-6 flex items-center justify-between z-20 font-mono sticky top-0 shrink-0">
      {/* Left: Sidebar Toggle Button & Page Title / Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-2 rounded-none bg-black border border-[#77DD77] text-[#77DD77] hover:bg-[#77DD77] hover:text-black transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center space-x-2 text-[10px] text-[#A0A0A0] font-mono tracking-widest uppercase">
            <span>NEXUS</span>
            <span>//</span>
            <span className="text-[#77DD77] font-bold">{getPageTitle()}</span>
          </div>
          <h2 className="text-base font-extrabold text-white tracking-wider leading-snug font-mono uppercase">{getPageTitle()}</h2>
        </div>
      </div>

      {/* Right Controls: Telemetry, Verify Equipment, Profile Dropdown */}
      <div className="flex items-center space-x-4">
        {/* Telemetry Status */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-none bg-black border border-[#222222] text-xs font-mono">
          <span className="w-2 h-2 rounded-none bg-[#77DD77] animate-pulse" />
          <span className="text-[#77DD77] font-bold text-[11px] uppercase tracking-wider">CHAIN: 31337</span>
        </div>

        {/* Verify Equipment Quick Launcher */}
        <button
          onClick={onOpenVerify}
          className="hidden sm:flex items-center space-x-1.5 btn-secondary text-xs font-mono font-bold"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>VERIFY SERIAL</span>
        </button>

        {/* Profile / Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 bg-black border border-[#77DD77] hover:bg-[#77DD77] hover:text-black text-[#77DD77] px-3 py-1.5 rounded-none text-xs font-mono transition-colors"
          >
            <div className="text-left">
              <span className="font-bold block leading-none">{activePersona.name.split(' ')[0]}</span>
              <span className="text-[9px] opacity-80 font-mono leading-none block mt-0.5">
                {activePersona.address.substring(0, 6)}...
              </span>
            </div>
            {getRoleBadge(activePersona.role)}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-80 bg-black border-2 border-[#77DD77] rounded-none shadow-[6px_6px_0px_#77DD77] z-50 p-2 text-xs font-mono">
              <div className="text-[10px] text-[#77DD77] font-bold uppercase px-3 py-2 border-b border-[#222222] tracking-wider">
                AUTHENTICATE SESSION PERSONA
              </div>
              <div className="py-1">
                {DEMO_PERSONAS.map(p => (
                  <div
                    key={p.key}
                    onClick={() => {
                      switchPersona(p.key);
                      setDropdownOpen(false);
                    }}
                    className={`p-2.5 rounded-none cursor-pointer transition-all mb-1 ${
                      activePersona.key === p.key
                        ? 'bg-[#77DD77] text-black font-bold border border-[#77DD77]'
                        : 'hover:bg-[#111111] text-[#FFFFFF] hover:text-[#77DD77] border border-transparent hover:border-[#77DD77]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{p.name}</span>
                      {getRoleBadge(p.role)}
                    </div>
                    <div className="text-[10px] font-mono truncate opacity-80">
                      {p.address}
                    </div>
                  </div>
                ))}
              </div>

              {onLogout && (
                <div className="border-t border-[#222222] pt-1 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-[#FF5555] hover:bg-[#FF5555] hover:text-black rounded-none text-xs font-bold transition-colors flex items-center justify-between uppercase tracking-wider"
                  >
                    <span>[SIGN OUT SESSION]</span>
                    <LogIn className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
