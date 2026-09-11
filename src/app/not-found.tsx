import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="bg-black border-2 border-[#77DD77] rounded-none p-8 max-w-md w-full shadow-[8px_8px_0px_#77DD77] space-y-4">
        <div className="w-12 h-12 rounded-none bg-black border border-[#77DD77] flex items-center justify-center text-[#77DD77] mx-auto font-mono font-extrabold text-lg">
          404
        </div>
        <h1 className="text-lg font-extrabold text-white uppercase tracking-wider">// PAGE NOT FOUND</h1>
        <p className="text-xs text-[#A0A0A0] font-mono">
          The requested system enclave resource or page location does not exist in the Nexus registry.
        </p>
        <Link
          href="/"
          className="btn-primary inline-block text-xs font-bold"
        >
          RETURN TO DASHBOARD
        </Link>
      </div>
    </div>
  );
}
