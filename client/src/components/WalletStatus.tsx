import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Wallet, AlertCircle, ExternalLink, Copy, Eye } from 'lucide-react';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { WalletConnectButton } from './WalletConnectButton';
import { useToast } from '@/hooks/use-toast';

export function WalletStatus() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Adres Kopyalandı",
        description: "Cüzdan adresi panoya kopyalandı",
      });
    }
  };

  const openBscScan = () => {
    if (address) {
      window.open(`https://bscscan.com/address/${address}`, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Cüzdan Bağlantısı Gerekli</h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Platform özelliklerini kullanmak için cüzdanınızı bağlayın
                </p>
              </div>
            </div>
            <WalletConnectButton size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-green-800 dark:text-green-200">Cüzdan Bağlı</h4>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs">
                  BSC
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                <code className="text-sm font-mono text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/50 px-2 py-1 rounded">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </code>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={copyAddress}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800"
              title="Adresi Kopyala"
            >
              <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
            </Button>
            
            <Button
              onClick={openBscScan}
              size="sm"
              variant="outline"
              className="h-8 px-3 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800 text-green-700 dark:text-green-300"
              title="BSC Scan'de Görüntüle"
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">BSC Scan</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}