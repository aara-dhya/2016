'use client';

import React from 'react';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Webhook, 
  ShieldCheck, 
  Activity, 
  Cpu,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  onLogout
}) => {
  const { activeRole } = useWeb3();

  const navItems = [
    { id: 'overview', href: '/home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', href: '/directory', label: 'Identities & Directory', icon: Users },
    { id: 'user', href: '/user', label: 'Asset Inventory', icon: Layers },
    { id: 'webhooks', href: '/webhooks', label: 'Web2 API Relayer', icon: Webhook },
    ...(activeRole === 'ADMIN' || activeRole === 'MANAGER'
      ? [{ id: 'admin', href: '/admin', label: 'Asset Registration & RBAC', icon: ShieldCheck }]
      : []),
    { id: 'auditor', href: '/auditor', label: 'Compliance Audit', icon: Activity }
  ];

  return (
    <aside
      className={`bg-black border-r border-[#222222] text-[#A0A0A0] flex flex-col justify-between transition-all duration-300 z-30 select-none font-mono ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand & Top Collapse Toggle */}
      <div>
        <div className="h-16 border-b border-[#222222] flex items-center justify-between shrink-0 px-4">
          {collapsed ? (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setCollapsed((prev: boolean) => !prev)}
                title="Expand Sidebar"
                className="p-2 rounded-none bg-black border border-[#77DD77] text-[#77DD77] hover:bg-[#77DD77] hover:text-black transition-colors"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/home"
                className="flex items-center space-x-3 cursor-pointer group overflow-hidden"
              >
                <div className="w-9 h-9 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77] group-hover:bg-[#77DD77] group-hover:text-black transition-colors shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h1 className="font-bold text-xs text-[#77DD77] tracking-wider uppercase leading-none mt-1">NEXUS // HR</h1>
                </div>
              </Link>

              <button
                onClick={() => setCollapsed((prev: boolean) => !prev)}
                title="Collapse Sidebar"
                className="text-[#A0A0A0] hover:text-[#77DD77] p-1.5 rounded-none hover:bg-[#111111] transition-colors shrink-0 border border-transparent hover:border-[#77DD77]"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map(item => {
            const Icon = item.icon;
            // activeTab from layout.tsx defaults to 'overview' if on /home
            const isActive = activeTab === item.id || (activeTab === 'home' && item.id === 'overview');
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-none text-xs font-mono font-semibold transition-all ${
                  isActive
                    ? 'bg-[#77DD77] text-black border border-[#77DD77] shadow-[2px_2px_0px_#FFFFFF]'
                    : 'text-[#A0A0A0] hover:text-[#77DD77] hover:bg-[#111111] hover:border hover:border-[#77DD77]/40'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-[#77DD77]'}`} />
                {!collapsed && <span className="truncate uppercase tracking-wider text-[11px]">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
