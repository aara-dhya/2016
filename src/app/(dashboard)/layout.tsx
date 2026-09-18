'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { TerminalFooter } from '../../components/TerminalFooter';
import { AssetVerificationModal } from '../../components/AssetVerificationModal';
import { IPFSModal } from '../../components/IPFSModal';
import { SSOLoginModal } from '../../components/SSOLoginModal';
import { useWeb3 } from '../../context/Web3Context';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setActivePersona } = useWeb3();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('nexus_session_token');
    const savedUser = localStorage.getItem('nexus_user_data');
    
    if (!savedToken) {
      router.replace('/login');
      return;
    }

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setActivePersona({
          key: parsed.email || parsed.key || 'user',
          name: parsed.name || 'Unknown',
          role: parsed.role || 'USER',
          address: parsed.address || parsed.walletAddress || '0x0000000000000000000000000000000000000000',
          did: parsed.did || 'did:nexus:user:0x000',
          description: parsed.department || parsed.description || 'Enterprise User'
        });
      } catch (e) {}
    }
    
    setIsAuthenticated(true);

    const savedSidebar = localStorage.getItem('nexus_sidebar_collapsed');
    if (savedSidebar === 'true') {
      setSidebarCollapsed(true);
    }
  }, [router, setActivePersona]);

  if (isAuthenticated === null) {
    return <div className="h-screen w-screen bg-black" />; // Loading state
  }

  const handleSetSidebarCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsed(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('nexus_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_session_token');
    localStorage.removeItem('nexus_user_data');
    router.replace('/login');
  };

  // Derive active tab from pathname
  const activeTab = pathname.split('/').pop() || 'overview';

  // Modals controlled by searchParams
  const isVerifyOpen = searchParams.get('verify') === 'true';
  const verifySN = searchParams.get('sn') || '';
  const isSSOOpen = searchParams.get('sso') === 'true';

  const closeVerify = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('verify');
    newParams.delete('sn');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const closeSSO = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('sso');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const openVerify = (serial?: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('verify', 'true');
    if (serial) newParams.set('sn', serial);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const openSSO = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sso', 'true');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white overflow-hidden font-mono">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={() => {}} // Now handled by Links in Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={handleSetSidebarCollapsed}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <Header
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={handleSetSidebarCollapsed}
          onOpenSSO={openSSO}
          onOpenVerify={() => openVerify()}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {children}
        </main>

        <TerminalFooter />
      </div>

      <AssetVerificationModal
        isOpen={isVerifyOpen}
        initialSerialNumber={verifySN}
        onClose={closeVerify}
      />

      <SSOLoginModal
        isOpen={isSSOOpen}
        onClose={closeSSO}
      />

      <IPFSModal />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black" />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
