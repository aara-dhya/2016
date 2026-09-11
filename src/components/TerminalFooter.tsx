'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Terminal, ChevronUp, ChevronDown } from 'lucide-react';

export const TerminalFooter: React.FC = () => {
  const { terminalLogs } = useWeb3();
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-[#77DD77] text-white font-mono text-xs shadow-[0px_-4px_0px_#000000]">
      {/* Header bar of terminal */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#111111] transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Terminal size={14} className="text-[#77DD77]" />
          <span className="font-bold text-[#77DD77] text-[11px] uppercase tracking-wider">// SYSTEM LEDGER LOG STREAM</span>
          <span className="text-[#A0A0A0] text-[10px]">({terminalLogs.length} events)</span>
        </div>

        <div className="flex items-center space-x-3 text-[10px] text-[#A0A0A0]">
          <span className="hidden md:inline truncate max-w-md text-[#77DD77]">
            LATEST: {terminalLogs[0] || 'System Enclave Active'}
          </span>
          <button className="text-[#77DD77] hover:text-white p-0.5">
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded terminal log window */}
      {expanded && (
        <div className="h-48 overflow-y-auto bg-black p-4 border-t border-[#222222] font-mono text-[11px] space-y-1.5 selection:bg-[#77DD77] selection:text-black">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="flex space-x-2 text-[#A0A0A0]">
              <span className="text-[#77DD77] shrink-0 font-bold">&gt;&gt;</span>
              <span className="text-white">{log}</span>
            </div>
          ))}
        </div>
      )}
    </footer>
  );
};
