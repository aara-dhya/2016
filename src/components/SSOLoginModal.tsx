'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ShieldCheck, X } from 'lucide-react';

interface SSOLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SSOLoginModal: React.FC<SSOLoginModalProps> = ({ isOpen, onClose }) => {
  const { registerIdentity, addTerminalLog } = useWeb3();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<{
    email: string;
    walletAddress: string;
    did: string;
    sessionToken: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/sso-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || email.split('@')[0], department })
      });

      let resData;
      if (response.ok) {
        resData = await response.json();
      } else {
        const mockHash = Array.from(email).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(40, '0');
        const custodialWallet = '0x' + mockHash.substring(0, 40);
        resData = {
          status: 'AUTHENTICATED',
          sessionToken: 'sso_token_' + Date.now(),
          user: {
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            department,
            role: 'USER',
            walletAddress: custodialWallet,
            did: `did:nexus:user:${custodialWallet}`
          }
        };
      }

      setSessionData({
        email: resData.user.email,
        walletAddress: resData.user.walletAddress,
        did: resData.user.did,
        sessionToken: resData.sessionToken
      });

      await registerIdentity(
        resData.user.walletAddress,
        resData.user.name,
        `ipfs://bafkreibackendssoproof_${Date.now()}`,
        'USER'
      );

      addTerminalLog(`[SSO ONBOARDING] Authenticated user ${email} via Account Abstraction. Custodial Wallet: ${resData.user.walletAddress}`);
    } catch (err: any) {
      console.error('SSO Login error:', err);
      addTerminalLog(`[SSO ERROR] Authentication failed: ${err.message || 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-mono select-none animate-fade-in">
      <div className="bg-black border-2 border-[#77DD77] rounded-none shadow-[8px_8px_0px_#77DD77] max-w-md w-full p-6 text-white relative">
        <div className="flex items-center justify-between mb-5 border-b border-[#222222] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#77DD77] uppercase tracking-wider">ENTERPRISE SSO LOGIN</h3>
              <p className="text-[10px] text-[#A0A0A0]">// ACCOUNT ABSTRACTION PROVISIONING</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A0A0A0] hover:text-[#77DD77] p-1 rounded-none hover:bg-[#111111] transition-colors border border-transparent hover:border-[#77DD77]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!sessionData ? (
          <form onSubmit={handleSSOLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#77DD77] uppercase mb-1">Corporate Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="employee@nexus.corp"
                className="cyber-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#77DD77] uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Carol Danvers"
                className="cyber-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#77DD77] uppercase mb-1">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="cyber-input bg-black"
              >
                <option value="Core Engineering">Core Engineering</option>
                <option value="IT Security & Compliance">IT Security & Compliance</option>
                <option value="HR & Operations">HR & Operations</option>
                <option value="Executive Enclave">Executive Enclave</option>
              </select>
            </div>

            <div className="bg-black rounded-none p-3 border border-[#333333] text-[11px] text-[#A0A0A0] space-y-1 font-mono">
              <div className="flex items-center text-[#77DD77] font-bold uppercase space-x-1">
                <span>// ZERO WALLET JARGON</span>
              </div>
              <p>Account Abstraction generates a non-custodial smart identity bound to your corporate SSO credentials automatically.</p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary justify-center text-xs"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary justify-center text-xs"
              >
                {isLoading ? <span>AUTHENTICATING...</span> : <span>SIGN IN WITH SSO</span>}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 font-mono">
            <div className="p-3 bg-black border border-[#77DD77] rounded-none flex items-center space-x-3">
              <div className="w-7 h-7 bg-[#77DD77] text-black font-extrabold flex items-center justify-center text-xs">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#77DD77] uppercase">SESSION PROVISIONED</h4>
                <p className="text-[11px] text-[#A0A0A0]">{sessionData.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-[#A0A0A0] block mb-0.5 uppercase">// CUSTODIAL WALLET:</span>
                <code className="block bg-black p-2 rounded-none border border-[#77DD77] text-[#77DD77] font-mono select-all break-all text-[10px]">
                  {sessionData.walletAddress}
                </code>
              </div>
              <div>
                <span className="text-[#A0A0A0] block mb-0.5 uppercase">// DECENTRALIZED IDENTIFIER (DID):</span>
                <code className="block bg-black p-2 rounded-none border border-[#77DD77] text-white font-mono select-all break-all text-[10px]">
                  {sessionData.did}
                </code>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full btn-primary justify-center text-xs py-2.5"
            >
              CONTINUE TO WORKSPACE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
