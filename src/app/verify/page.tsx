'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWeb3 } from '../../context/Web3Context';
import { ShieldCheck, Loader2 } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const { setActivePersona, registerIdentity } = useWeb3();
  const [status, setStatus] = useState('Verifying Cryptographic Magic Link...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No verification token found in URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/sso-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('Authentication successful! Initializing Enclave...');
          
          // Set Local Storage
          localStorage.setItem('nexus_session_token', data.sessionToken);
          localStorage.setItem('nexus_user_data', JSON.stringify(data.user));
          
          // We can optionally register identity here on the client side just like the modal did
          try {
            await registerIdentity(
              data.user.walletAddress,
              data.user.name,
              `ipfs://bafkreibackendssoproof_${Date.now()}`,
              'USER'
            );
          } catch (e) {
            console.error("Failed to register identity on chain", e);
          }
          
          // Redirect to Dashboard
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setError(data.error || 'Verification failed.');
        }
      } catch (err) {
        setError('A network error occurred while verifying the token.');
      }
    };

    verifyToken();
  }, [token, router, registerIdentity]);

  if (error) {
    return (
      <div className="bg-black border border-[#FF5555] p-6 text-center max-w-md w-full shadow-[6px_6px_0px_#FF5555]">
        <h2 className="text-[#FF5555] font-bold text-lg mb-2">VERIFICATION FAILED</h2>
        <p className="text-white text-sm opacity-80 mb-4">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-[#FF5555] text-black font-bold px-4 py-2 hover:bg-white transition-colors uppercase text-xs tracking-wider"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black border border-[#77DD77] p-8 text-center max-w-md w-full shadow-[6px_6px_0px_#77DD77]">
      <ShieldCheck className="w-12 h-12 text-[#77DD77] mx-auto mb-4" />
      <h2 className="text-[#77DD77] font-bold text-lg mb-2">SECURE ONBOARDING</h2>
      <div className="flex items-center justify-center space-x-2 text-white text-sm opacity-80">
        <Loader2 className="w-4 h-4 animate-spin text-[#77DD77]" />
        <span>{status}</span>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono select-none p-4">
      <Suspense fallback={<div className="text-[#77DD77]">Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
