'use client';

import { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AdminDashboard } from '../../../components/AdminDashboard';

function AdminContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openSSO = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sso', 'true');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const openVerify = (serial: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('verify', 'true');
    newParams.set('sn', serial);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <AdminDashboard 
      onOpenSSO={openSSO}
      onVerifyAsset={openVerify}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div />}>
      <AdminContent />
    </Suspense>
  );
}
