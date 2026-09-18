'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { LoginView } from '../components/LoginView';
import { LandingView } from '../components/LandingView';
import { AdminDashboard } from '../components/AdminDashboard';
import { UserDashboard } from '../components/UserDashboard';
import { AuditorDashboard } from '../components/AuditorDashboard';
import { EmployeeDatabase } from '../components/EmployeeDatabase';
import { WebhookTriggerPanel } from '../components/WebhookTriggerPanel';
import { SSOLoginModal } from '../components/SSOLoginModal';
import { AssetVerificationModal } from '../components/AssetVerificationModal';
import { IPFSModal } from '../components/IPFSModal';
import { TerminalFooter } from '../components/TerminalFooter';
import { useWeb3 } from '../context/Web3Context';

export default function Home() {
  const { setActivePersona } = useWeb3();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isSSOOpen, setIsSSOOpen] = useState<boolean>(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
  const [verifySN, setVerifySN] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('nexus_session_token');
    const savedUser = localStorage.getItem('nexus_user_data');
    if (savedToken) {
      setSessionToken(savedToken);
    }
    if (savedUser) {
      try {
        setActivePersona(JSON.parse(savedUser));
      } catch (e) {}
    }

    const savedSidebar = localStorage.getItem('nexus_sidebar_collapsed');
    if (savedSidebar === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  const handleSetSidebarCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsed(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('nexus_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLoginSuccess = (token: string, user?: any) => {
    localStorage.setItem('nexus_session_token', token);
    setSessionToken(token);
    if (user) {
      localStorage.setItem('nexus_user_data', JSON.stringify(user));
      setActivePersona(user);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_session_token');
    localStorage.removeItem('nexus_user_data');
    setSessionToken(null);
  };

  const handleOpenVerify = (serial?: string) => {
    if (serial) setVerifySN(serial);
    else setVerifySN('');
    setIsVerifyOpen(true);
  };

  // Gated Route: If unauthenticated, show pitch-dark SIWE/SSO Login View
  if (!sessionToken) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onOpenSSO={() => setIsSSOOpen(true)}
        />
        <SSOLoginModal
          isOpen={isSSOOpen}
          onClose={() => setIsSSOOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-black text-white overflow-hidden font-mono">
      {/* Collapsible Left-Hand Sidebar (Section 2 - w-64 / w-16) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={handleSetSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        {/* Header Bar with Sidebar Toggle */}
        <Header
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={handleSetSidebarCollapsed}
          onOpenSSO={() => setIsSSOOpen(true)}
          onOpenVerify={() => handleOpenVerify()}
          onLogout={handleLogout}
        />

        {/* Scrollable Child Route Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {activeTab === 'overview' && (
            <LandingView
              setActiveTab={setActiveTab}
              onOpenSSO={() => setIsSSOOpen(true)}
              onOpenVerify={() => handleOpenVerify()}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              onOpenSSO={() => setIsSSOOpen(true)}
              onVerifyAsset={(sn) => handleOpenVerify(sn)}
            />
          )}

          {activeTab === 'directory' && (
            <EmployeeDatabase
              onOpenSSOLogin={() => setIsSSOOpen(true)}
            />
          )}

          {activeTab === 'webhooks' && (
            <WebhookTriggerPanel />
          )}

          {activeTab === 'user' && (
            <UserDashboard
              onVerifyAsset={(sn) => handleOpenVerify(sn)}
            />
          )}

          {activeTab === 'auditor' && <AuditorDashboard />}
        </main>

        {/* Real-Time Telemetry Footer Bar */}
        <TerminalFooter />
      </div>

      {/* Modals */}
      <SSOLoginModal
        isOpen={isSSOOpen}
        onClose={() => setIsSSOOpen(false)}
      />

      <AssetVerificationModal
        isOpen={isVerifyOpen}
        initialSerialNumber={verifySN}
        onClose={() => setIsVerifyOpen(false)}
      />

      <IPFSModal />
    </div>
  );
}
