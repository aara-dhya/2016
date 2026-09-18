import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '../context/Web3Context';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'Nexus',
  description: 'Enterprise SaaS dApp for W3C Decentralized Identifiers (DIDs), Role-Based Access Control (RBAC), and Soulbound Asset Management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white font-mono antialiased">
        <ThemeProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
