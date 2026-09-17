'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Webhook, Code, Key } from 'lucide-react';

export interface WebhookLog {
  id: number;
  timestamp: string;
  triggerType: string;
  role: string;
  userEmail: string;
  actionExecuted: string;
  status: string;
}

export const WebhookTriggerPanel: React.FC = () => {
  const { addTerminalLog } = useWeb3();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('ENGINEERING_ROLE');
  const [targetEmail, setTargetEmail] = useState<string>('alice@nexus.corp');

  const fetchWebhookLogs = async () => {
    try {
      const res = await fetch('/api/webhooks/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch webhook logs:', err);
    }
  };

  useEffect(() => {
    fetchWebhookLogs();
    const interval = setInterval(fetchWebhookLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerWebhook = async (customRole?: string) => {
    const roleToUse = customRole || selectedRole;
    setLoading(true);

    try {
      const res = await fetch('/api/webhooks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: roleToUse,
          userEmail: targetEmail,
          employeeName: targetEmail.split('@')[0]
        })
      });

      if (res.ok) {
        const data = await res.json();
        addTerminalLog(`[WEBHOOK RELAYER] Triggered ${data.triggeredWebhook.triggerType} for ${targetEmail}`);
        await fetchWebhookLogs();
      }
    } catch (err: any) {
      addTerminalLog(`[WEBHOOK ERROR] Failed to send webhook event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-[#77DD77] rounded-none p-6 text-white shadow-[4px_4px_0px_#222222] space-y-6 font-mono w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222222] pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-[#77DD77] animate-pulse" />
            <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">WEB2 API WEBHOOK RELAYER MONITOR</h3>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-1 font-mono">
            Automated Web3-to-Web2 Sync: GitHub API Repo Access & Kisi Physical Door Access
          </p>
        </div>

        {/* Trigger Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTriggerWebhook('ENGINEERING_ROLE')}
            disabled={loading}
            className="btn-secondary text-xs font-bold"
          >
            <Code className="w-3.5 h-3.5" />
            <span>SIMULATE GITHUB INVITE</span>
          </button>

          <button
            onClick={() => handleTriggerWebhook('MANAGER_ROLE')}
            disabled={loading}
            className="btn-secondary text-xs font-bold"
          >
            <Key className="w-3.5 h-3.5" />
            <span>SIMULATE KISI DOOR ACCESS</span>
          </button>
        </div>
      </div>

      {/* Manual Trigger Form */}
      <div className="bg-black p-4 border border-[#333333] grid grid-cols-1 md:grid-cols-3 gap-3 items-end font-mono">
        <div>
          <label className="block text-[11px] font-bold text-[#77DD77] uppercase mb-1">// TARGET EMPLOYEE EMAIL</label>
          <input
            type="email"
            value={targetEmail}
            onChange={e => setTargetEmail(e.target.value)}
            className="cyber-input text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#77DD77] uppercase mb-1">// ROLE EVENT TRIGGER</label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="cyber-input bg-black text-xs font-mono"
          >
            <option value="ENGINEERING_ROLE">ENGINEERING_ROLE (GitHub Private Repos)</option>
            <option value="MANAGER_ROLE">MANAGER_ROLE (Kisi Server Room Access)</option>
            <option value="ADMIN">ADMIN (Full Clearance Webhooks)</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => handleTriggerWebhook()}
            disabled={loading}
            className="btn-primary w-full justify-center text-xs py-2 font-bold"
          >
            {loading ? <span>DISPATCHING...</span> : <span>DISPATCH CUSTOM WEBHOOK</span>}
          </button>
        </div>
      </div>

      {/* Webhook Activity Log Table */}
      <div>
        <h4 className="text-xs font-bold text-[#77DD77] uppercase tracking-widest mb-2">// LIVE WEBHOOK RELAY LOGS</h4>
        <div className="overflow-x-auto border border-[#222222]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222222] text-[#77DD77] bg-black font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Trigger Type</th>
                <th className="py-2.5 px-3">User Email</th>
                <th className="py-2.5 px-3">Executed Web2 Action</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[#A0A0A0] font-mono">
                    No webhooks dispatched yet.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-[#111111] transition-colors">
                    <td className="py-2.5 px-3 text-[#A0A0A0]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3">
                      <span className="cyber-badge text-[10px]">
                        {log.triggerType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white font-bold">{log.userEmail}</td>
                    <td className="py-2.5 px-3 text-[#A0A0A0]">{log.actionExecuted}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[#77DD77] font-bold text-[10px] px-1.5 py-0.5 border border-[#77DD77]">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
