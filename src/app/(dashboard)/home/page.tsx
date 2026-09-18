'use client';

import { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { LandingView } from '../../../components/LandingView';

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openSSO = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sso', 'true');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const openVerify = (serial?: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('verify', 'true');
    if (serial) newParams.set('sn', serial);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <LandingView 
      setActiveTab={(tab) => router.push(`/${tab}`)}
      onOpenSSO={openSSO}
      onOpenVerify={() => openVerify()}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}
