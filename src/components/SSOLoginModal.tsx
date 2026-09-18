'use client';

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ShieldCheck, X, Mail } from 'lucide-react';

interface SSOLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SSOLoginModal: React.FC<SSOLoginModalProps> = ({ isOpen, onClose }) => {
  const { addTerminalLog } = useWeb3();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Core Engineering');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/sso-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || email.split('@')[0], department })
      });

      if (response.ok) {
        setEmailSent(true);
        addTerminalLog(`[SSO ONBOARDING] Dispatched cryptographic magic link to ${email}.`);
      } else {
        const errData = await response.json();
        addTerminalLog(`[SSO ERROR] Failed to dispatch email: ${errData.error}`);
      }
    } catch (err: any) {
      console.error('SSO Login error:', err);
      addTerminalLog(`[SSO ERROR] Network error during SSO dispatch.`);
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

        {!emailSent ? (
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
                <span>// SECURE MAGIC LINK</span>
              </div>
              <p>You will receive a secure email containing a cryptographic token. Clicking the link will authenticate your session.</p>
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
                {isLoading ? <span>DISPATCHING...</span> : <span>SEND MAGIC LINK</span>}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 font-mono text-center py-4">
            <Mail className="w-12 h-12 text-[#77DD77] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#77DD77] uppercase">MAGIC LINK DISPATCHED</h4>
            <p className="text-xs text-[#A0A0A0]">
              We have securely dispatched a cryptographic token to <br/>
              <strong className="text-white">{email}</strong>
            </p>
            <p className="text-xs text-[#A0A0A0] mt-2 border border-[#333333] p-3">
              Please check your inbox. Clicking the link in the email will automatically authenticate this session and provision your custodial wallet.
            </p>
            <button
              onClick={onClose}
              className="w-full btn-secondary justify-center text-xs mt-4"
            >
              CLOSE WINDOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
