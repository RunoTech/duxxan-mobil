import { useState, useEffect } from 'react';
import { walletManager } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';

export function useSimpleWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    const connection = walletManager.getConnection();
    if (connection) {
      setIsConnected(true);
      setAddress(connection.address);
    }

    // Listen for wallet connection changes
    const unsubscribe = walletManager.onConnectionChange((connected, addr) => {
      setIsConnected(connected);
      setAddress(addr || null);
    });

    return unsubscribe;
  }, []);

  const connectMetaMask = async () => {
    setIsConnecting(true);
    try {
      const connection = await walletManager.connectMetaMask();
      toast({
        title: "MetaMask Bağlandı",
        description: `${connection.address.slice(0, 6)}...${connection.address.slice(-4)} adresine bağlandınız`,
      });
    } catch (error: any) {
      toast({
        title: "MetaMask Bağlantı Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const connectTrustWallet = async () => {
    setIsConnecting(true);
    try {
      const connection = await walletManager.connectTrustWallet();
      toast({
        title: "Trust Wallet Bağlandı",
        description: `${connection.address.slice(0, 6)}...${connection.address.slice(-4)} adresine bağlandınız`,
      });
    } catch (error: any) {
      toast({
        title: "Trust Wallet Bağlantı Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    await walletManager.disconnectWallet();
    toast({
      title: "Bağlantı Kesildi",
      description: "Cüzdan bağlantısı güvenli bir şekilde kesildi",
    });
  };

  return {
    isConnected,
    address,
    isConnecting,
    connectMetaMask,
    connectTrustWallet,
    disconnect,
    connection: isConnected && address ? { address, provider: null, signer: null, chainId: 56 } : null
  };
}