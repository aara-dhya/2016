'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Signup is handled seamlessly via the SSO/Wallet login process
    router.replace('/login');
  }, [router]);

  return null;
}
