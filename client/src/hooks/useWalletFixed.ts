import { useState, useEffect } from 'react';
import { WalletManager } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';

export interface WalletConnection {
  address: string;
  chainId: number;
  walletType: 'metamask' | 'trustwallet';
  isConnected: boolean;
}

export function useWalletFixed() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Simplified connection check - only look at localStorage and window objects
  const checkWalletConnection = () => {
    try {
      // Check if MetaMask is connected
      if (window.ethereum && window.ethereum.selectedAddress) {
        const address = window.ethereum.selectedAddress;
        const chainId = parseInt(window.ethereum.chainId || '0x38', 16);
        
        const newConnection: WalletConnection = {
          address,
          chainId,
          walletType: 'metamask',
          isConnected: true
        };
        
        console.log('Wallet connection detected:', newConnection);
        setConnection(newConnection);
        localStorage.setItem('wallet_connection', JSON.stringify(newConnection));
        return true;
      }

      // Check localStorage for persisted connection
      const saved = localStorage.getItem('wallet_connection');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.isConnected && parsed.address) {
            setConnection(parsed);
            return true;
          }
        } catch (e) {
          localStorage.removeItem('wallet_connection');
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
    
    return false;
  };

  // Initialize connection on mount
  useEffect(() => {
    // Multiple checks with delays to handle iframe context
    const checkMultipleTimes = () => {
      if (checkWalletConnection()) return;
      
      setTimeout(() => {
        if (checkWalletConnection()) return;
        
        setTimeout(() => {
          checkWalletConnection();
        }, 500);
      }, 100);
    };

    checkMultipleTimes();
    
    // Additional check every 10 seconds to ensure connection is maintained (reduced frequency)
    const interval = setInterval(() => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const currentAddress = window.ethereum.selectedAddress;
        if (!connection || connection.address !== currentAddress) {
          // Only log if address actually changed
          if (connection?.address !== currentAddress) {
            console.log('Wallet address changed, updating connection');
          }
          checkWalletConnection();
        }
      }
    }, 10000);

    // Listen for MetaMask account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0];
          const chainId = parseInt(window.ethereum.chainId || '0x38', 16);
          
          const newConnection: WalletConnection = {
            address,
            chainId,
            walletType: 'metamask',
            isConnected: true
          };
          
          setConnection(newConnection);
          localStorage.setItem('wallet_connection', JSON.stringify(newConnection));
        } else {
          setConnection(null);
          localStorage.removeItem('wallet_connection');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return () => {
        clearInterval(interval);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async (walletType: 'metamask' | 'trustwallet' = 'metamask') => {
    setIsConnecting(true);
    
    try {
      // Iframe context kontrolü
      if (window.top !== window.self) {
        toast({
          title: 'Güvenlik Uyarısı',
          description: 'Bu sayfayı yeni sekmede açmanız gerekebilir. MetaMask popup\'ları iframe\'de engellenebilir.',
          variant: 'destructive',
        });
      }
      
      // Trust Wallet ve MetaMask için aynı ethereum provider'ı kullan
      if (!window.ethereum) {
        toast({
          variant: 'destructive',
          title: 'Cüzdan Bulunamadı',
          description: 'Lütfen MetaMask veya Trust Wallet yükleyin',
        });
        return false;
      }

      console.log('Requesting MetaMask accounts...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('MetaMask accounts received:', accounts.length);

      if (accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const address = accounts[0];
      const chainId = parseInt(window.ethereum.chainId || '0x38', 16);

      // Switch to BSC if needed
      if (chainId !== 56) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x38',
                chainName: 'Binance Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              }],
            });
          }
        }
      }

      const connection: WalletConnection = {
        address,
        chainId: 56,
        walletType: walletType,
        isConnected: true
      };

      setConnection(connection);
      localStorage.setItem('wallet_connection', JSON.stringify(connection));

      toast({
        title: 'Cüzdan Bağlandı',
        description: `${address.slice(0, 6)}...${address.slice(-4)} adresine bağlandınız`,
      });

      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        variant: 'destructive',
        title: 'Bağlantı Hatası',
        description: 'Cüzdan bağlantısı kurulurken hata oluştu',
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnection(null);
    setUser(null);
    localStorage.removeItem('wallet_connection');
    localStorage.removeItem('wallet_authenticated');
    localStorage.removeItem('wallet_address');
    
    // MetaMask'ı da temizle
    if (window.ethereum) {
      try {
        // MetaMask'tan bağlantıyı kesmek için disconnect çağrısı
        window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        }).catch(() => {
          // Eski MetaMask versiyonları bu metodu desteklemez
          console.log('Wallet permissions could not be revoked (older MetaMask version)');
        });
      } catch (error) {
        console.log('Could not revoke wallet permissions');
      }
    }
    
    toast({
      title: 'Cüzdan Bağlantısı Kesildi',
      description: 'Cüzdan bağlantınız başarıyla kesildi. Yeniden bağlanırken popup görmelisiniz.',
    });
  };

  const isConnected = !!connection;
  const address = connection?.address;
  const chainId = connection?.chainId;
  
  // Debug: Log connection state
  console.log('Wallet hook state:', { isConnected, address, connection });

  const getApiHeaders = () => {
    if (!connection?.address) {
      return {};
    }
    return {
      'X-Wallet-Address': connection.address,
      'X-Chain-Id': connection.chainId?.toString() || '56'
    };
  };

  return {
    connection,
    isConnected,
    isConnecting,
    address,
    chainId,
    user,
    connectWallet,
    disconnectWallet,
    setUser,
    getApiHeaders
  };
}