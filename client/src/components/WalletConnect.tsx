import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { walletManager } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  showBalance?: boolean;
}

export function WalletConnect({ onConnect, showBalance = false }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    const connection = walletManager.getConnection();
    if (connection) {
      setIsConnected(true);
      setAddress(connection.address);
      if (showBalance) {
        loadBalance();
      }
    }

    // Auto-connect if previously connected
    walletManager.autoConnect().then((connected) => {
      if (connected) {
        const conn = walletManager.getConnection();
        if (conn) {
          setIsConnected(true);
          setAddress(conn.address);
          if (showBalance) {
            loadBalance();
          }
        }
      }
    });

    // Listen for connection changes
    const unsubscribe = walletManager.onConnectionChange((connected, addr) => {
      setIsConnected(connected);
      setAddress(addr || null);
      if (connected && addr) {
        onConnect?.(addr);
        if (showBalance) {
          loadBalance();
        }
      } else {
        setBalance(null);
      }
    });

    return unsubscribe;
  }, [onConnect, showBalance]);

  const loadBalance = async () => {
    try {
      const bal = await walletManager.getBalance();
      const balanceInBNB = (parseFloat(bal) / 1e18).toFixed(4);
      setBalance(balanceInBNB);
    } catch (error) {
      console.error('Balance load failed:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const connection = await walletManager.connectWallet();
      
      // Register or login user with wallet address
      const response = await apiRequest('POST', '/api/auth/wallet-login', {
        walletAddress: connection.address,
        chainId: connection.chainId
      });

      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Cüzdan Bağlandı",
          description: `${connection.address.slice(0, 6)}...${connection.address.slice(-4)} adresine bağlandınız`,
        });
        
        onConnect?.(connection.address);
      } else {
        throw new Error('Kullanıcı kaydı başarısız');
      }
      
    } catch (error: any) {
      toast({
        title: "Bağlantı Hatası",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await walletManager.disconnectWallet();
    
    // Logout from server
    try {
      await apiRequest('POST', '/api/auth/logout', {});
    } catch (error) {
      console.error('Logout failed:', error);
    }
    
    toast({
      title: "Cüzdan Bağlantısı Kesildi",
      description: "Güvenli bir şekilde çıkış yapıldı",
    });
  };

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Cüzdan Bağlı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Adres:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </code>
          </div>
          
          {showBalance && balance && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bakiye:</span>
              <span className="text-sm font-medium">{balance} BNB</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
            className="w-full"
          >
            Bağlantıyı Kes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wallet className="h-4 w-4" />
          Cüzdan Bağlantısı
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!window.ethereum ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              MetaMask veya Trust Wallet gerekli
            </div>
            <p className="text-xs text-muted-foreground">
              Devam etmek için MetaMask veya Trust Wallet yüklemeniz gerekiyor.
            </p>
          </div>
        ) : (
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bağlanıyor...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Cüzdan Bağla
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}