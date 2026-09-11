'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Terminal, ChevronUp, ChevronDown, Activity } from 'lucide-react';

export const TerminalFooter: React.FC = () => {
  const { terminalLogs } = useWeb3();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t-2 border-[#77DD77] text-xs font-mono">
      {/* Terminal Toggle Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-[#050505] px-4 py-2 flex justify-between items-center cursor-pointer border-b border-[#222] hover:bg-[#111] transition-all"
      >
        <div className="flex items-center gap-2 text-[#77DD77] font-bold text-xs">
          <Terminal size={14} />
          <span>CYBERNET_RPC_CONSOLE</span>
          <span className="text-[10px] text-[#A0A0A0] font-normal">
            ({terminalLogs.length} LOG MESSAGES)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#A0A0A0]">
          <span className="hidden sm:inline text-[#77DD77]">
            LATEST: {terminalLogs[0] || 'Ready'}
          </span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Terminal Log Console */}
      {isExpanded && (
        <div className="bg-black p-4 h-48 overflow-y-auto space-y-1 text-[11px] text-[#77DD77] border-t border-[#222]">
          {terminalLogs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-[#38A368]">{`>`}</span>
              <span className={log.includes('REVERT') ? 'text-[#FF3333]' : ''}>{log}</span>
            </div>
          ))}
        </div>
      )}
    </footer>
  );
};
