import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '../context/Web3Context';

export const metadata: Metadata = {
  title: 'CYBER_ID // Decentralized Identity & Asset Enclave',
  description: 'Blockchain-based dApp for W3C Decentralized Identifiers (DIDs), Role-Based Access Control (RBAC), and Soulbound NFT Asset Management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
