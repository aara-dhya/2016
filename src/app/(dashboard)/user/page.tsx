'use client';

import { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { UserDashboard } from '../../../components/UserDashboard';

function UserContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openVerify = (serial: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('verify', 'true');
    newParams.set('sn', serial);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <UserDashboard 
      onVerifyAsset={openVerify}
    />
  );
}

export default function UserPage() {
  return (
    <Suspense fallback={<div />}>
      <UserContent />
    </Suspense>
  );
}
