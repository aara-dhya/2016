'use client';

import { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { EmployeeDatabase } from '../../../components/EmployeeDatabase';

function DirectoryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openSSO = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sso', 'true');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <EmployeeDatabase 
      onOpenSSOLogin={openSSO}
    />
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div />}>
      <DirectoryContent />
    </Suspense>
  );
}
