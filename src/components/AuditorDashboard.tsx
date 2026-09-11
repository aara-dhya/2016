'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Eye, Search, Filter, ShieldCheck, Download, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

export const AuditorDashboard: React.FC = () => {
  const { auditLogs, refreshState } = useWeb3();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    if (categoryFilter === 'ALL') return matchesSearch;
    if (categoryFilter === 'IDENTITY') return matchesSearch && log.actionType.includes('IDENTITY');
    if (categoryFilter === 'MINT') return matchesSearch && log.actionType.includes('MINT');
    if (categoryFilter === 'LOCK') return matchesSearch && log.actionType.includes('LOCK');
    if (categoryFilter === 'TRANSFER') return matchesSearch && log.actionType.includes('TRANSFER');
    return matchesSearch;
  });

  const getActionBadge = (actionType: string) => {
    if (actionType.includes('IDENTITY')) {
      return <span className="bg-black text-[#77DD77] border border-[#77DD77] px-2 py-0.5 text-[10px] font-bold">[IDENTITY]</span>;
    }
    if (actionType.includes('MINT')) {
      return <span className="bg-[#77DD77] text-black border border-[#77DD77] px-2 py-0.5 text-[10px] font-extrabold">[MINT]</span>;
    }
    if (actionType.includes('LOCK')) {
      return <span className="bg-[#38A368] text-white border border-[#77DD77] px-2 py-0.5 text-[10px] font-bold">[LOCK_CONTROL]</span>;
    }
    if (actionType.includes('TRANSFER')) {
      return <span className="bg-[#111] text-white border border-[#444] px-2 py-0.5 text-[10px] font-bold">[TRANSFER]</span>;
    }
    return <span className="cyber-badge">{actionType}</span>;
  };

  const exportLogsAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header Banner */}
      <div className="cyber-card bg-[#050505] border-2 border-[#77DD77] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#77DD77] text-xs font-bold">
            <Eye size={18} /> IMMUTABLE AUDIT TRAIL & PROVENANCE INSPECTOR
          </div>
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider mt-1">
            Global Compliance Audit Ledger
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refreshState}
            className="btn-secondary text-xs flex items-center gap-1 py-2 px-3"
          >
            <RefreshCw size={14} /> REFRESH
          </button>
          <button
            onClick={exportLogsAsJSON}
            className="btn-primary text-xs flex items-center gap-1 py-2 px-3"
          >
            <Download size={14} /> EXPORT AUDIT LOGS
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-card border border-[#77DD77] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-3 text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search by actor, target address, or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="cyber-input pl-10 text-xs"
          />
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-1 text-xs">
          {['ALL', 'IDENTITY', 'MINT', 'LOCK', 'TRANSFER'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 border font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-[#77DD77] text-black border-[#77DD77]'
                  : 'bg-black text-[#A0A0A0] border-[#333] hover:border-[#77DD77] hover:text-[#77DD77]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="cyber-card border border-[#77DD77] space-y-4">
        <div className="flex justify-between items-center border-b border-[#222] pb-3 text-xs text-[#A0A0A0]">
          <div>
            SHOWING <span className="text-[#77DD77] font-bold">{filteredLogs.length}</span> OF{' '}
            <span className="text-white font-bold">{auditLogs.length}</span> IMMUTABLE EVENT RECORDS
          </div>
          <div className="flex items-center gap-1 text-[#77DD77]">
            <ShieldCheck size={14} /> ZERO-KNOWLEDGE PROOF COMPLIANT
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#333] text-[#A0A0A0] bg-[#0A0A0A]">
                <th className="p-3">LOG ID</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">EVENT CATEGORY</th>
                <th className="p-3">ACTOR (INITIATOR)</th>
                <th className="p-3">TARGET ADDRESS</th>
                <th className="p-3">TRANSACTION DETAILS PAYLOAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#080808]">
                  <td className="p-3 font-bold text-[#77DD77]">#{log.id}</td>
                  <td className="p-3 text-[#A0A0A0] font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">{getActionBadge(log.actionType)}</td>
                  <td className="p-3 font-mono text-[#77DD77]">
                    {log.actor.substring(0, 8)}...{log.actor.substring(36)}
                  </td>
                  <td className="p-3 font-mono text-[#A0A0A0]">
                    {log.target && log.target !== '0x0000000000000000000000000000000000000000'
                      ? `${log.target.substring(0, 8)}...${log.target.substring(36)}`
                      : 'SYSTEM'}
                  </td>
                  <td className="p-3 text-white max-w-md leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
