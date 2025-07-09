import { ReactNode } from 'react';
import { WalletStatus } from './WalletStatus';

interface PageWithWalletProps {
  children: ReactNode;
  className?: string;
}

export function PageWithWallet({ children, className = "" }: PageWithWalletProps) {
  return (
    <div className={`min-h-screen bg-white dark:bg-[#1D2025] transition-colors duration-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Content - Wallet status removed, now only in header */}
        {children}
      </div>
    </div>
  );
}