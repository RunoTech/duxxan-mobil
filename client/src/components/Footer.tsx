import { Link } from 'wouter';
import { ExternalLink, Download, CreditCard, Building2, ArrowRightLeft, Shield, Globe, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import metamaskLogo from '@/assets/images/metamask-logo.svg';
import trustWalletLogo from '@/assets/images/trust-wallet-logo.svg';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Wallet Installation Guide */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-duxxan-yellow" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cüzdan Kurulumu</h3>
            </div>
            
            <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <img 
                    src={metamaskLogo}
                    alt="MetaMask" 
                    className="w-4 h-4 mr-2"
                  />
                  MetaMask Kurulumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  1. metamask.io adresine gidin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  2. "Download" butonuna tıklayın
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3. Tarayıcınız için uzantıyı indirin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  4. Cüzdan oluşturun veya içe aktarın
                </p>
                <Button 
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  size="sm" 
                  className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  MetaMask İndir <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                  <img 
                    src={trustWalletLogo}
                    alt="Trust Wallet" 
                    className="w-4 h-4 mr-2"
                  />
                  Trust Wallet Kurulumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  1. App Store veya Google Play'den indirin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  2. Yeni cüzdan oluşturun
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3. Seed kelimelerinizi güvenle saklayın
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  4. Binance Smart Chain ağını ekleyin
                </p>
                <Button 
                  onClick={() => window.open('https://trustwallet.com/download', '_blank')}
                  size="sm" 
                  className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Trust Wallet İndir <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Crypto Purchase Guide */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kripto Para Satın Alma</h3>
            </div>
            
            <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  MetaMask ile Satın Alma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  1. MetaMask cüzdanınızı açın
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  2. "Buy" butonuna tıklayın
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3. Kredi kartı bilgilerinizi girin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  4. BNB satın alın (BSC ağı için)
                </p>
                <Badge variant="secondary" className="text-xs">
                  Minimum: $20 USD
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Trust Wallet ile Satın Alma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  1. Trust Wallet uygulamasını açın
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  2. "Buy" seçeneğini seçin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3. Moonpay veya Simplex seçin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  4. Kredi kartı ile BNB satın alın
                </p>
                <Badge variant="secondary" className="text-xs">
                  KYC Gerekli
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                      Güvenlik Uyarısı
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Sadece resmi sitelerden cüzdan indirin. Seed kelimelerinizi kimseyle paylaşmayın.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal Guide */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ödül Kazanma  Rehberi</h3>
            </div>
            
            <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Binance'e Transfer
                </CardTitle>
                <CardDescription className="text-xs">
                  Kazandığınız ödülleri Binance'e gönderin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  1. Binance hesabınızı açın
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  2. "Wallet" → "Deposit" seçin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3. BNB seçin, BSC ağını seçin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  4. Deposit adresini kopyalayın
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  5. Cüzdanınızdan bu adrese gönderin
                </p>
                <Button 
                  onClick={() => window.open('https://www.binance.com/tr/register', '_blank')}
                  size="sm" 
                  variant="outline"
                  className="w-full mt-2"
                >
                  Binance'e Üye Ol <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Banka Hesabına Çekme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  1. Binance'de "Fiat and Spot" seçin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  2. BNB'yi TRY'ye çevirin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  3. "Withdraw" → "Bank Transfer" seçin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  4. Banka bilgilerinizi girin
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  5. Minimum 50 TL çekim yapılabilir
                </p>
                <Badge variant="secondary" className="text-xs">
                  KYC Doğrulama Gerekli
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Alternative Exchanges */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alternatif Borsalar</h3>
            </div>
            
            <div className="space-y-3">
              <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">BTCTurk</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Türkiye'nin en büyük borsası</p>
                    </div>
                    <Button 
                      onClick={() => window.open('https://www.btcturk.com/', '_blank')}
                      size="sm" 
                      variant="outline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Paribu</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Türk lirası desteği</p>
                    </div>
                    <Button 
                      onClick={() => window.open('https://www.paribu.com/', '_blank')}
                      size="sm" 
                      variant="outline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Coinbase</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Global borsa</p>
                    </div>
                    <Button 
                      onClick={() => window.open('https://www.coinbase.com/', '_blank')}
                      size="sm" 
                      variant="outline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">KuCoin</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Düşük komisyon</p>
                    </div>
                    <Button 
                      onClick={() => window.open('https://www.kucoin.com/', '_blank')}
                      size="sm" 
                      variant="outline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Vergi Uyarısı
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Kripto para kazançlarınızı vergi dairesi ile paylaşmayı unutmayın.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-duxxan-yellow" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">DUXXAN</span>
              <Badge variant="secondary" className="text-xs">
                Blockchain Platform
              </Badge>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-duxxan-yellow transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="hover:text-duxxan-yellow transition-colors">
                Kullanım Şartları
              </Link>
              <Link href="/support" className="hover:text-duxxan-yellow transition-colors">
                Destek
              </Link>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 DUXXAN. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}