import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Users, Coins, CheckCircle, AlertTriangle, FileText, Globe, Clock, CreditCard, Award } from 'lucide-react';
import { PageWithWallet } from '@/components/PageWithWallet';
import metamaskLogo from '@/assets/images/metamask-logo.svg';
import trustWalletLogo from '@/assets/images/trust-wallet-logo.svg';

export default function Terms() {
  return (
    <PageWithWallet>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-8 h-8 text-duxxan-yellow" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kullanım Şartları ve Platform Rehberi
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            DUXXAN platformunun nasıl çalıştığı, kullanım koşulları, komisyon yapısı ve tüm özellikler hakkında detaylı bilgiler
          </p>
          <Badge variant="secondary" className="text-sm">
            Son Güncelleme: 17 Haziran 2025
          </Badge>
        </div>

        {/* Platform Overview */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-blue-600" />
              <span>DUXXAN Platform Genel Bakış</span>
            </CardTitle>
            <CardDescription>Blockchain tabanlı ödül havuzu ve bağış platformu nasıl çalışır</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Platform Amacı</h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li>• Şeffaf ve güvenli havuz sistemi</li>
                  <li>• Toplum odaklı bağış kampanyaları</li>
                  <li>• Blockchain teknolojisi ile güvence</li>
                  <li>• Küresel erişim ve katılım</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Temel Özellikler</h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li>• MetaMask ve Trust Wallet desteği</li>
                  <li>• Binance Smart Chain (BSC) ağı</li>
                  <li>• Gerçek zamanlı bildirimler</li>
                  <li>• Çoklu dil desteği</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Raffles Work */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-green-600" />
              <span>Havuz Sistemi Nasıl Çalışır</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">1</span>
                </div>
                <h4 className="font-semibold">Havuz Oluşturma</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kullanıcılar ödül değeri, bilet token değerini ve maksimum bilet token adetini belirleyerek Havuz oluşturur.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold">Bilet Satışı</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Katılımcılar BNB ağında ki USDT İle bilet tokenı alır. Tüm işlemler blockchain üzerinde kayıt altına alınır.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold">Kazanan Seçimi</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Biletler tükendi or süre dolduğunda, blockchain tabanlı rastgele sayı ile kazanan belirlenir.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Ödül Havuzu Kuralları</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-green-600 dark:text-green-400">İzin Verilen</h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Yasal ürün ve hizmet ödül havuzları</li>
                    <li>• Eğitim ve kurs ödülleri</li>
                    <li>• Teknoloji ürünleri</li>
                    <li>• Kripto para ödülleri</li>
                    <li>• Hayır kurumu bağışları</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-red-600 dark:text-red-400">Yasak Olan</h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Yasal olmayan ürünler</li>
                    <li>• Kumar ve bahis içerikleri</li>
                    <li>• Sahte veya kopya ürünler</li>
                    <li>• Yetişkin içerikli materyaller</li>
                    <li>• Şiddet teşvik eden içerikler</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Donations Work */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-purple-600" />
              <span>Bağış Sistemi Nasıl Çalışır</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">1</span>
                </div>
                <h4 className="font-semibold">Kampanya Oluşturma</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bağış hedefi, süre ve detaylı açıklama ile kampanya oluşturulur.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold">Bağış Toplama</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kullanıcılar istedikleri miktarda BNB bağışlayabilir. Tüm bağışlar görüntülenebilir.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-semibold">Fon Transferi</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hedef tutara ulaşıldığında veya süre dolduğunda fonlar kampanya sahibine aktarılır.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Bağış Kategorileri</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <h5 className="font-medium">Sağlık</h5>
                  <p className="text-xs text-gray-500">Tedavi masrafları, ameliyat</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h5 className="font-medium">Eğitim</h5>
                  <p className="text-xs text-gray-500">Okul masrafları, kurs</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h5 className="font-medium">Çevre</h5>
                  <p className="text-xs text-gray-500">Doğa koruma, temizlik</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h5 className="font-medium">Acil Durum</h5>
                  <p className="text-xs text-gray-500">Afet yardımı, kriz</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coins className="w-6 h-6 text-yellow-600" />
              <span>Komisyon Yapısı</span>
            </CardTitle>
            <CardDescription>
              Platform kullanım ücretleri ve komisyon oranları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800 dark:text-green-200">
                    Havuz işlem Komisyonları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platform Komisyonu</span>
                    <Badge variant="secondary">%5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Blockchain İşlem Ücreti</span>
                    <Badge variant="secondary">Gas Fee</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Minimum Ödül Havuzu Oluşturma Adeti</span>
                    <Badge variant="secondary">1000 USDT</Badge>
                  </div>
                  <Separator />
                  <div className="text-xs text-green-700 dark:text-green-300">
                    * Komisyon toplanan fonlardan otomatik olarak düşülür
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-800 dark:text-purple-200">
                    Bağış Komisyonları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platform Komisyonu</span>
                    <Badge variant="secondary">%2.5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Blockchain İşlem Ücreti</span>
                    <Badge variant="secondary">Gas Fee</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Minimum Bağış Tutarı</span>
                    <Badge variant="secondary">10 USDT</Badge>
                  </div>
                  <Separator />
                  <div className="text-xs text-purple-700 dark:text-purple-300">
                    * Bağış komisyonu bağışçıdan değil, kampanya sahibinden alınır
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Komisyon Kullanım Alanları
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div>• Sunucu maliyetleri</div>
                <div>• Güvenlik denetimleri</div>
                <div>• Platform geliştirme</div>
                <div>• Müşteri desteği</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval and Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>Onaylama ve Doğrulama Sistemi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Otomatik Onaylama</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium">Anlık Onay</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Basit çekilişler ve bağışlar anında yayınlanır
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium">Hızlı İnceleme</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI destekli içerik kontrolü 2-5 dakika içinde
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Manuel İnceleme</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium">Detaylı İnceleme</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Yüksek tutarlı kampanyalar 24-48 saat içinde
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium">Güvenlik Kontrolü</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Şüpheli aktiviteler için kapsamlı inceleme
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">İnceleme Kriterleri</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-green-600 dark:text-green-400">İçerik Kalitesi</h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Açık ve anlaşılır açıklama</li>
                    <li>• Doğru kategori seçimi</li>
                    <li>• Uygun görsel kullanımı</li>
                    <li>• Gerçekçi hedefler</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-blue-600 dark:text-blue-400">Güvenlik</h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Kullanıcı kimlik doğrulama</li>
                    <li>• Sahte hesap kontrolü</li>
                    <li>• Spam engelleme</li>
                    <li>• Kötüye kullanım önleme</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-purple-600 dark:text-purple-400">Yasal Uyum</h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Yerel yasal gereksinimleri</li>
                    <li>• Telif hakkı kontrolü</li>
                    <li>• Vergi yükümlülükleri</li>
                    <li>• Uluslararası düzenlemeler</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights and Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Kullanıcı Hakları ve Sorumlulukları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400">Kullanıcı Hakları</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Kişisel verilerin güvenliği</li>
                  <li>• Şeffaf işlem geçmişi</li>
                  <li>• 7/24 müşteri desteği</li>
                  <li>• Adil ödül havuzu garantisi</li>
                  <li>• Fonların güvenli transferi</li>
                  <li>• Hesap askıya alma durumunda bilgilendirilme</li>
                  <li>• Kişisel verilerin silinmesini talep etme</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400">Kullanıcı Sorumlulukları</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Doğru ve güncel bilgi sağlama</li>
                  <li>• Platform kurallarına uyma</li>
                  <li>• Cüzdan güvenliğini sağlama</li>
                  <li>• Yasal vergi yükümlülüklerini yerine getirme</li>
                  <li>• Telif hakkı ihlali yapmama</li>
                  <li>• Spam ve kötüye kullanım yapmama</li>
                  <li>• Sahte bilgi paylaşmama</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment and Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-green-600" />
              <span>Ödeme ve Güvenlik</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Kabul Edilen Ödeme Yöntemleri</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <img 
                      src={metamaskLogo}
                      alt="MetaMask" 
                      className="w-8 h-8"
                    />
                    <div>
                      <h5 className="font-medium">MetaMask</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">En popüler Web3 cüzdanı</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <img 
                      src={trustWalletLogo}
                      alt="Trust Wallet" 
                      className="w-8 h-8"
                    />
                    <div>
                      <h5 className="font-medium">Trust Wallet</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mobil cüzdan çözümü</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Güvenlik Önlemleri</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• End-to-end şifreleme</li>
                  <li>• Multi-factor authentication</li>
                  <li>• Smart contract denetimleri</li>
                  <li>• DDoS koruması</li>
                  <li>• Soğuk cüzdan saklama</li>
                  <li>• 24/7 güvenlik izleme</li>
                  <li>• Penetrasyon testleri</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Önemli Güvenlik Uyarısı
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Seed kelimelerinizi asla kimseyle paylaşmayın. DUXXAN ekibi size bu bilgileri hiçbir zaman sormaz. 
                    Şüpheli durumları derhal support@duxxan.com adresine bildirin.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact and Support */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim ve Destek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Teknik Destek</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  7/24 teknik destek hizmeti
                </p>
                <p className="text-sm">
                  <strong>E-posta:</strong> support@duxxan.com<br />
                  <strong>Yanıt Süresi:</strong> 2-4 saat içinde
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">İş Geliştirme</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Kurumsal işbirlikleri için
                </p>
                <p className="text-sm">
                  <strong>E-posta:</strong> business@duxxan.com<br />
                  <strong>Yanıt Süresi:</strong> 24 saat içinde
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Bu kullanım şartları son olarak 17 Haziran 2025 tarihinde güncellenmiştir.
          <br />
          Değişiklikler önceden bildirilmeksizin yapılabilir.
        </div>
      </div>
    </PageWithWallet>
  );
}