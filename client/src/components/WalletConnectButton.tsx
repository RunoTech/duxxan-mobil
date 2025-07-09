import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Shield, Zap, CheckCircle } from 'lucide-react';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';

interface WalletConnectButtonProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showIcon?: boolean;
}

export function WalletConnectButton({ 
  size = 'default', 
  variant = 'default', 
  className = '',
  showIcon = true 
}: WalletConnectButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting } = useWallet();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <Button onClick={disconnectWallet} variant="outline" size="sm">
          Çıkış
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          size={size} 
          variant={variant}
          className={`bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white ${className}`}
        >
          {showIcon && <Wallet className="mr-2 h-4 w-4" />}
          Cüzdan Bağla
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Cüzdan Bağlantısı</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Security Notice */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Güvenli Bağlantı</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Cüzdanınız güvenli bir şekilde bağlanacak. Özel anahtarlarınız asla paylaşılmaz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Options */}
          <div className="space-y-3">
            <Button
              onClick={async () => {
                await connectWallet('metamask');
                setIsDialogOpen(false);
              }}
              disabled={isConnecting}
              className="w-full h-16 justify-start space-x-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20"
              variant="outline"
            >
              <img 
                src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                alt="MetaMask" 
                className="w-8 h-8"
              />
              <div className="text-left flex-1">
                <div className="font-semibold">MetaMask</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">En popüler Web3 cüzdanı</div>
              </div>
              <Zap className="w-5 h-5 text-orange-500" />
            </Button>
            
            <Button
              onClick={async () => {
                await connectWallet('trustwallet');
                setIsDialogOpen(false);
              }}
              disabled={isConnecting}
              className="w-full h-16 justify-start space-x-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20"
              variant="outline"
            >
              <img 
                src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" 
                alt="Trust Wallet" 
                className="w-8 h-8"
              />
              <div className="text-left flex-1">
                <div className="font-semibold">Trust Wallet</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Mobil için en iyi cüzdan</div>
              </div>
              <Zap className="w-5 h-5 text-blue-500" />
            </Button>

            <Button
              onClick={async () => {
                await connectWallet('trustwallet');
                setIsDialogOpen(false);
              }}
              disabled={isConnecting}
              className="w-full h-16 justify-start space-x-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20"
              variant="outline"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WC</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Diğer Cüzdanlar</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Mobil cüzdanlar için</div>
              </div>
              <Zap className="w-5 h-5 text-purple-500" />
            </Button>
          </div>

          {/* Features */}
          <Card className="bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Cüzdan bağladıktan sonra:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Çekilişlere katılabilirsiniz</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Bağış yapabilirsiniz</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>İşlemlerinizi takip edebilirsiniz</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Profil sayfanıza erişebilirsiniz</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isConnecting && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cüzdan bağlanıyor...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}