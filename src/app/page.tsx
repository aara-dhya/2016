'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { LandingView } from '../components/LandingView';
import { AdminDashboard } from '../components/AdminDashboard';
import { UserDashboard } from '../components/UserDashboard';
import { AuditorDashboard } from '../components/AuditorDashboard';
import { IPFSModal } from '../components/IPFSModal';
import { TerminalFooter } from '../components/TerminalFooter';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono pb-16">
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main App Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'overview' && <LandingView setActiveTab={setActiveTab} />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'user' && <UserDashboard />}
        {activeTab === 'auditor' && <AuditorDashboard />}
      </main>

      {/* IPFS Inspector Modal */}
      <IPFSModal />

      {/* Real-time Status Console */}
      <TerminalFooter />
    </div>
  );
}
