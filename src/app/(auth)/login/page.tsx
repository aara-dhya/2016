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
      localStorage.setItem('nexus_user_data', JSON.stringify(user));
      setActivePersona(user);
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
