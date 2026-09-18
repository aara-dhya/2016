'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginView } from '../../../components/LoginView';
import { SSOLoginModal } from '../../../components/SSOLoginModal';
import { useWeb3 } from '../../../context/Web3Context';

export default function LoginPage() {
  const router = useRouter();
  const { setActivePersona } = useWeb3();
  const [isSSOOpen, setIsSSOOpen] = useState<boolean>(false);

  useEffect(() => {
    // If already logged in, redirect to home
    const savedToken = localStorage.getItem('nexus_session_token');
    if (savedToken) {
      router.push('/home');
    }
  }, [router]);

  const handleLoginSuccess = (token: string, user?: any) => {
    localStorage.setItem('nexus_session_token', token);
    if (user) {
      const persona = {
        key: user.email || user.key || 'user',
        name: user.name || 'Unknown',
        role: user.role || 'USER',
        address: user.address || user.walletAddress || '0x0000000000000000000000000000000000000000',
        did: user.did || 'did:nexus:user:0x000',
        description: user.department || user.description || 'Enterprise User'
      };
      localStorage.setItem('nexus_user_data', JSON.stringify(persona));
      setActivePersona(persona);
    }
    router.push('/home');
  };

  return (
    <>
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onOpenSSO={() => setIsSSOOpen(true)}
      />
      <SSOLoginModal
        isOpen={isSSOOpen}
        onClose={() => setIsSSOOpen(false)}
      />
    </>
  );
}
