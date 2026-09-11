'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Activity, ShieldCheck, Database, Search } from 'lucide-react';

export const AuditorDashboard: React.FC = () => {
  const { auditLogs } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 font-mono w-full">
      {/* Header Banner */}
      <div className="bg-black border border-[#77DD77] rounded-none p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[4px_4px_0px_#222222]">
        <div>
          <div className="flex items-center gap-2 text-[#77DD77] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={16} /> // IMMUTABLE COMPLIANCE LEDGER
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-wider uppercase mt-1">
            AUDIT LOG TRAIL & REGISTRY HISTORY
          </h1>
        </div>
        <div className="text-right text-xs text-[#A0A0A0] border-l border-[#222222] pl-3">
          READ-ONLY ACCESS: <span className="text-[#77DD77] font-bold">[AUDITOR_ROLE]</span><br />
          TOTAL LOGS: <span className="text-white font-bold">{auditLogs.length} EVENTS</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-black border border-[#222222] p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-2.5 text-[#77DD77]" />
          <input
            type="text"
            placeholder="Search by Actor, Target, or Action Details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="cyber-input pl-9 text-xs font-mono"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="cyber-input bg-black text-xs font-mono"
          >
            <option value="ALL">All Event Types</option>
            <option value="SYSTEM_GENESIS">SYSTEM_GENESIS</option>
            <option value="IDENTITY_REGISTERED">IDENTITY_REGISTERED</option>
            <option value="ASSET_REGISTERED">ASSET_REGISTERED</option>
            <option value="ASSET_LOCK_TOGGLED">ASSET_LOCK_TOGGLED</option>
            <option value="ASSET_TRANSFERRED">ASSET_TRANSFERRED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-black border border-[#77DD77] rounded-none p-6 shadow-[4px_4px_0px_#222222] space-y-4">
        <div className="flex justify-between items-center border-b border-[#222222] pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Activity size={18} className="text-[#77DD77]" /> VERIFIED AUDIT RECORDS ({filteredLogs.length})
          </h2>
        </div>

        <div className="overflow-x-auto border border-[#222222]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222222] text-[#77DD77] bg-black font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Actor Account</th>
                <th className="p-3">Target Address</th>
                <th className="p-3">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[#A0A0A0]">
                    No compliance audit logs match your search parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#111111] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#77DD77]">#{log.id}</td>
                    <td className="p-3 text-[#A0A0A0] text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="cyber-badge">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="p-3 text-white font-mono font-bold truncate max-w-[140px]">
                      {log.actor.substring(0, 8)}...
                    </td>
                    <td className="p-3 text-[#A0A0A0] font-mono truncate max-w-[140px]">
                      {log.target.substring(0, 8)}...
                    </td>
                    <td className="p-3 text-[#A0A0A0] max-w-md leading-relaxed">
                      {log.details}
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
