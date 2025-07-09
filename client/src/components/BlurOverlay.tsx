import { Button } from '@/components/ui/button';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';

export function BlurOverlay() {
  const { isConnected, isConnecting, connectWallet, connection } = useWallet();

  // console.log('BlurOverlay render:', { isConnected, isConnecting, hasConnection: !!connection });

  if (isConnected) {
    return null;
  }

  const handleMetaMaskConnect = async () => {
    try {
      console.log('Starting MetaMask connection...');
      
      // Check MetaMask availability
      if (!window.ethereum?.isMetaMask || window.ethereum?.isTrust) {
        alert('MetaMask bulunamadı. Lütfen MetaMask eklentisini yükleyin.');
        return;
      }
      
      await connectWallet('metamask');
    } catch (error: any) {
      console.error('MetaMask connection failed:', error);
      // Error handling is done in useWallet hook
    }
  };

  const handleTrustWalletConnect = async () => {
    try {
      console.log('Starting Trust Wallet connection...');
      
      // Check if Trust Wallet is available before attempting connection
      const userAgent = navigator.userAgent.toLowerCase();
      const isTrustWalletBrowser = userAgent.includes('trust');
      const hasTrustWalletProvider = window.ethereum?.isTrust || (window as any).trustwallet;
      
      if (!isTrustWalletBrowser && !hasTrustWalletProvider) {
        alert('Trust Wallet bulunamadı. Lütfen Trust Wallet uygulamasını yükleyin veya Trust Wallet tarayıcısını kullanın.');
        return;
      }
      
      await connectWallet('trustwallet');
    } catch (error: any) {
      console.error('Trust Wallet connection failed:', error);
      // Error handling is done in useWallet hook
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-md mx-4 text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Çekilişler ve bağışlar dahil tüm DUXXAN özelliklerine erişmek için cüzdanınızı bağlayın.
        </p>
        <div className="space-y-3">
          <Button
            onClick={handleMetaMaskConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white w-full font-semibold shadow-lg transition-all duration-200"
          >
            {isConnecting ? '🔄 Bağlanıyor...' : '🦊 MetaMask ile Bağlan'}
          </Button>
          <Button
            onClick={handleTrustWalletConnect}
            disabled={isConnecting}
            variant="outline"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-blue-600 font-semibold shadow-lg transition-all duration-200"
          >
            {isConnecting ? '🔄 Bağlanıyor...' : '🛡️ Trust Wallet ile Bağlan'}
          </Button>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
              Güvenli BSC (Binance Smart Chain) ağı kullanılacaktır
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                ⚠️ Eğer bağlantı sorunu yaşıyorsanız, bu sayfayı yeni bir sekmede açmayı deneyin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
