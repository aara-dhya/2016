'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Users, UserPlus } from 'lucide-react';

interface EmployeeDatabaseProps {
  onIssueAssetForEmployee?: (email: string) => void;
  onOpenSSOLogin?: () => void;
}

export const EmployeeDatabase: React.FC<EmployeeDatabaseProps> = ({
  onIssueAssetForEmployee,
  onOpenSSOLogin
}) => {
  const { identities, assets } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredIdentities = identities.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.did.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || emp.assignedRole.startsWith(roleFilter);
    return matchesSearch && matchesRole;
  });

  const getAssetCountForEmployee = (walletAddress: string, did: string) => {
    return assets.filter(
      a => a.ownerAddress.toLowerCase() === walletAddress.toLowerCase() || a.ownerDID === did
    ).length;
  };

  return (
    <div className="bg-black border border-[#77DD77] rounded-none p-6 text-white shadow-[4px_4px_0px_#222222] space-y-5 font-mono w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222222] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-white tracking-wider uppercase">ENTERPRISE EMPLOYEE HR DIRECTORY</h3>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-1 font-mono">
            Decentralized Identity (DID) & Account Abstraction Custodial Wallet Registry
          </p>
        </div>

        <div className="flex space-x-2">
          {onOpenSSOLogin && (
            <button
              onClick={onOpenSSOLogin}
              className="btn-primary text-xs font-bold"
            >
              <UserPlus className="w-4 h-4" />
              <span>PROVISION SSO USER</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Employee Name, DID, or Wallet Address..."
            className="cyber-input text-xs font-mono"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="cyber-input bg-black text-xs font-mono"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="AUDITOR">AUDITOR</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto border border-[#222222]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#222222] text-[#77DD77] bg-black font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Employee / Identity</th>
              <th className="py-2.5 px-3">Assigned Role</th>
              <th className="py-2.5 px-3">Decentralized Identifier (DID)</th>
              <th className="py-2.5 px-3">Custodial Wallet</th>
              <th className="py-2.5 px-3 text-center">Assets Held</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222] font-mono">
            {filteredIdentities.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[#A0A0A0] font-mono">
                  No matching employees found in registry.
                </td>
              </tr>
            ) : (
              filteredIdentities.map(emp => {
                const assetCount = getAssetCountForEmployee(emp.walletAddress, emp.did);
                return (
                  <tr key={emp.did} className="hover:bg-[#111111] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{emp.name}</div>
                      <div className="text-[10px] text-[#A0A0A0]">Registered on-chain</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="cyber-badge">
                        {emp.assignedRole.replace('_ROLE', '')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#77DD77] text-[10px] truncate max-w-[180px]">
                      {emp.did}
                    </td>
                    <td className="py-3 px-3 text-[#A0A0A0] text-[10px] truncate max-w-[140px]">
                      {emp.walletAddress}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-black text-[#77DD77] border border-[#77DD77]">
                        {assetCount} {assetCount === 1 ? 'ASSET' : 'ASSETS'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      {onIssueAssetForEmployee && (
                        <button
                          onClick={() => onIssueAssetForEmployee(emp.walletAddress)}
                          className="btn-secondary py-1 px-2.5 text-[10px] font-bold"
                        >
                          ISSUE ASSET
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
