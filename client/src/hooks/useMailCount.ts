import { useQuery } from '@tanstack/react-query';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';

export function useMailCount() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ['mail-count', address],
    queryFn: async () => {
      if (!address) return 0;
      
      const response = await fetch('/api/mail/unread-count', {
        headers: {
          'X-Wallet-Address': address
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch mail count');
      }
      
      const data = await response.json();
      return parseInt(data.data?.count || 0);
    },
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}