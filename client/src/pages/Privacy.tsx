import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Database, Users, Globe } from 'lucide-react';
import { PageWithWallet } from '@/components/PageWithWallet';

export default function Privacy() {
  return (
    <PageWithWallet>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-8 h-8 text-duxxan-yellow" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gizlilik Politikası
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında detaylı bilgiler
          </p>
          <Badge variant="secondary" className="text-sm">
            Son Güncelleme: 17 Haziran 2025
          </Badge>
        </div>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-blue-600" />
              <span>Veri Toplama</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Otomatik Toplanan Veriler</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Cüzdan adresi (herkese açık blockchain verisi)</li>
                  <li>• İşlem geçmişi (blockchain kayıtları)</li>
                  <li>• IP adresi ve konum bilgisi</li>
                  <li>• Tarayıcı ve cihaz bilgileri</li>
                  <li>• Platform kullanım istatistikleri</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Kullanıcı Tarafından Sağlanan</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Profil bilgileri (ad, meslek, bio)</li>
                  <li>• İletişim bilgileri (e-posta, telefon)</li>
                  <li>• Sosyal medya hesapları</li>
                  <li>• Çekiliş ve bağış içerikleri</li>
                  <li>• Yüklenen fotoğraflar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-6 h-6 text-green-600" />
              <span>Veri Kullanımı</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700 dark:text-green-300">Platform İşlevselliği</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Hesap yönetimi</li>
                  <li>• İşlem doğrulama</li>
                  <li>• Çekiliş kazanan seçimi</li>
                  <li>• Bağış takibi</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700 dark:text-green-300">Güvenlik</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Dolandırıcılık önleme</li>
                  <li>• Hesap güvenliği</li>
                  <li>• Spam engelleme</li>
                  <li>• Risk analizi</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700 dark:text-green-300">İletişim</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Bildirimler</li>
                  <li>• Destek hizmetleri</li>
                  <li>• Önemli güncellemeler</li>
                  <li>• Yasal gereklilikler</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-6 h-6 text-purple-600" />
              <span>Veri Korunması</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">Teknik Önlemler</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• AES-256 şifreleme</li>
                  <li>• HTTPS protokolü</li>
                  <li>• Güvenli sunucu altyapısı</li>
                  <li>• Düzenli güvenlik denetimleri</li>
                  <li>• Yedekleme sistemleri</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">İdari Önlemler</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Sınırlı erişim yetkileri</li>
                  <li>• Personel eğitimleri</li>
                  <li>• Veri işleme protokolleri</li>
                  <li>• Olay müdahale planları</li>
                  <li>• Düzenli güvenlik güncellemeleri</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-orange-600" />
              <span>Kullanıcı Hakları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-700 dark:text-orange-300">KVKK Hakları</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>• İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                  <li>• İşleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>• Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-700 dark:text-orange-300">Düzeltme ve Silme</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                  <li>• Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                  <li>• İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Party Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-red-600" />
              <span>Üçüncü Taraf Hizmetler</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Blockchain Şeffaflığı
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Tüm blockchain işlemleriniz (cüzdan adresi, işlem tutarları, tarihler) halka açık ve kalıcıdır. 
                  Bu veriler BSC Scan gibi block explorer'larda herkes tarafından görüntülenebilir.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Entegre Hizmetler</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• MetaMask (cüzdan bağlantısı)</li>
                    <li>• Trust Wallet (cüzdan bağlantısı)</li>
                    <li>• Binance Smart Chain (blockchain altyapısı)</li>
                    <li>• Firebase (gerçek zamanlı veriler)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Analitik Hizmetler</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Platform kullanım istatistikleri</li>
                    <li>• Performans izleme</li>
                    <li>• Hata raporlama</li>
                    <li>• Güvenlik izleme</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Veri Sorumlusu İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">KVKK Başvuruları</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Kişisel veri haklarınızla ilgili başvurular için
                </p>
                <p className="text-sm">
                  <strong>E-posta:</strong> kvkk@duxxan.com<br />
                  <strong>Yanıt Süresi:</strong> 30 gün içinde
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Veri İhlali Bildirimi</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Güvenlik ihlali şüpheniz varsa
                </p>
                <p className="text-sm">
                  <strong>E-posta:</strong> security@duxxan.com<br />
                  <strong>Yanıt Süresi:</strong> 24 saat içinde
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Politika Güncellemeleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler durumunda:
              </p>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                <li>• Platform üzerinden bildirim yapılır</li>
                <li>• E-posta ile bilgilendirilirsiniz</li>
                <li>• 30 gün önceden duyuru yapılır</li>
                <li>• Yeni politika kabul edilene kadar eski politika geçerli kalır</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Bu gizlilik politikası son olarak 17 Haziran 2025 tarihinde güncellenmiştir.
          <br />
          DUXXAN, kişisel verilerinizin korunmasını ve gizliliğinizi en üst düzeyde önemser.
        </div>
      </div>
    </PageWithWallet>
  );
}