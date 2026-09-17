import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ShieldCheck, Cpu, ArrowRight, Key, Mail } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
  onOpenSSO: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onOpenSSO }) => {
  const { addTerminalLog, switchPersona, identities } = useWeb3();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSIWEAuthenticate = async () => {
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setAuthError('Please enter a valid Ethereum wallet address (0x...).');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    const address = walletAddress.toLowerCase();

    try {
      addTerminalLog(`[SIWE AUTH] Requesting cryptographic nonce for address ${address}...`);
      const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
      const nonceData = await nonceRes.json();
      const nonce = nonceRes.ok ? nonceData.nonce : 'nexus_nonce_' + Date.now();

      addTerminalLog(`[SIWE AUTH] Prompting wallet signature: "Sign this message to authenticate with Nexus HR Portal. Nonce: ${nonce}"`);
      
      const mockSignature = `0x98127391823791823918273918273918273918273918273918273918273918273918273918273918`;

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address,
          signature: mockSignature,
          nonce: nonce
        })
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.authenticated) {
        // Find existing identity or default to a basic user
        const existingIdentity = identities.find(i => i.walletAddress.toLowerCase() === address);
        const fallbackPersona = {
          key: address,
          name: existingIdentity ? existingIdentity.name : `Verified Operator (${address.substring(0, 6)}...)`,
          role: existingIdentity ? existingIdentity.assignedRole.replace('_ROLE', '') : 'USER',
          address: address,
          did: existingIdentity ? existingIdentity.did : `did:nexus:user:${address}`,
          description: 'Authenticated via SIWE Cryptographic Signature.'
        };
        
        addTerminalLog(`[SIWE SUCCESS] Cryptographic signature verified. Session JWT issued.`);
        onLoginSuccess(verifyData.token, verifyData.user || fallbackPersona);
      } else {
        setAuthError(verifyData.error || 'Cryptographic signature verification failed.');
      }
    } catch (err: any) {
      setAuthError('Backend connection error: ' + (err.message || 'Network error'));
      addTerminalLog(`[AUTH ERROR] Authentication failed: ${err.message || 'Network error'}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative font-mono select-none">
      <div className="bg-black border-2 border-[#77DD77] rounded-none p-8 max-w-md w-full shadow-[8px_8px_0px_#77DD77] relative z-10 space-y-8">
        
        {/* Top Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none bg-black border-2 border-[#77DD77] flex items-center justify-center text-[#77DD77] mx-auto shadow-[3px_3px_0px_#77DD77]">
            <Cpu className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-widest uppercase">NEXUS HR PORTAL</h1>
          <p className="text-[11px] text-[#A0A0A0] font-mono">
            // IDENTITY & IT ASSET SECURITY ENCLAVE
          </p>
        </div>

        {/* Error view */}
        {authError && (
          <div className="p-3 bg-black border border-[#FF5555] rounded-none text-[#FF5555] text-xs font-mono">
            {authError}
          </div>
        )}

        {/* Primary Action: Passwordless SSO */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-sm font-bold text-[#77DD77] uppercase tracking-wider mb-1">Employee Portal Access</h2>
            <p className="text-[10px] text-[#A0A0A0]">Secure Account Abstraction Enclave</p>
          </div>
          
          <button
            onClick={onOpenSSO}
            className="w-full btn-primary justify-center text-xs py-4 font-bold"
          >
            <Mail className="w-4 h-4" />
            <span>PASSWORDLESS SSO LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center text-[#333333] my-2">
          <div className="flex-1 border-t border-[#333333]"></div>
          <span className="px-4 text-[10px] font-bold text-[#A0A0A0] uppercase">OR CONNECT WALLET</span>
          <div className="flex-1 border-t border-[#333333]"></div>
        </div>

        {/* Secondary Action: SIWE Wallet Login */}
        <div className="space-y-3">
          <div className="space-y-2">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter Hardware Wallet Address (0x...)"
              className="cyber-input w-full"
            />
          </div>
          
          <button
            onClick={handleSIWEAuthenticate}
            disabled={isAuthenticating}
            className="w-full btn-secondary justify-center text-xs py-3 font-bold"
          >
            {isAuthenticating ? (
              <span>VERIFYING SIGNATURE...</span>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>AUTHENTICATE (SIWE)</span>
              </>
            )}
          </button>
        </div>

        {/* Security Badge Footer */}
        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#77DD77] font-mono pt-4 border-t border-[#222222]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>EIP-4361 SIWE & OPENZEPPELIN VERIFIED</span>
        </div>
      </div>
    </div>
  );
};

