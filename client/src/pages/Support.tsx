import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, Mail, Clock, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { PageWithWallet } from '@/components/PageWithWallet';
import { useToast } from '@/hooks/use-toast';

export default function Support() {
  const [supportForm, setSupportForm] = useState({
    category: '',
    subject: '',
    message: '',
    email: '',
    priority: 'normal'
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Destek Talebi Gönderildi",
      description: "Talebiniz alındı. 2-4 saat içinde size dönüş yapacağız.",
    });
    setSupportForm({
      category: '',
      subject: '',
      message: '',
      email: '',
      priority: 'normal'
    });
  };

  return (
    <PageWithWallet>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <HelpCircle className="w-8 h-8 text-duxxan-yellow" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Destek Merkezi
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Size yardımcı olmak için buradayız. Sorularınızı sorun veya yaygın problemlerin çözümlerini bulun.
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-sm">Cüzdan Bağlama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                MetaMask ve Trust Wallet bağlama rehberi
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-sm">İşlem Sorunları</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Başarısız işlemler ve gas fee sorunları
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-sm">Hesap Sorunları</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Profil güncelleme ve hesap güvenliği
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-sm">Acil Durumlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Güvenlik ihlali ve kayıp fonlar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <span>Sık Sorulan Sorular</span>
            </CardTitle>
            <CardDescription>
              En çok sorulan sorular ve cevapları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="wallet-connection">
                <AccordionTrigger className="text-left">
                  Cüzdanımı nasıl bağlarım?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    DUXXAN platformuna cüzdan bağlamak için:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Sağ üst köşedeki "Cüzdan Bağla" butonuna tıklayın</li>
                    <li>MetaMask veya Trust Wallet seçin</li>
                    <li>Cüzdan uygulamanızda "Bağlan" butonuna tıklayın</li>
                    <li>Binance Smart Chain (BSC) ağını seçin</li>
                  </ol>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Not:</strong> İlk kez BSC ağını kullanıyorsanız, ağ ayarlarını manuel olarak eklemeniz gerekebilir.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="transaction-failed">
                <AccordionTrigger className="text-left">
                  İşlemim neden başarısız oldu?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    İşlem başarısızlığının yaygın nedenleri:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li><strong>Yetersiz BNB:</strong> Gas fee için yeterli BNB bakiyeniz yok</li>
                    <li><strong>Düşük gas fee:</strong> İşlem ücreti çok düşük belirlenmiş</li>
                    <li><strong>Ağ yoğunluğu:</strong> BSC ağında yoğunluk yaşanıyor</li>
                    <li><strong>İptal edilen işlem:</strong> Cüzdanda işlemi iptal ettiniz</li>
                  </ul>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Çözüm:</strong> Cüzdanınızda en az 0.01 BNB bulundurun ve gas fee'yi "fast" olarak ayarlayın.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="raffle-winner">
                <AccordionTrigger className="text-left">
                  Çekiliş kazananı nasıl belirleniyor?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    DUXXAN şeffaf ve adil bir çekiliş sistemi kullanır:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Tüm bilet sahipleri blockchain'de kayıtlıdır</li>
                    <li>Çekiliş bittiğinde, block hash kullanılarak rastgele sayı üretilir</li>
                    <li>Bu sayı bilet sayısına bölünür ve kalan rakam kazanan bileti belirler</li>
                    <li>Sonuç herkes tarafından BSC Scan'de doğrulanabilir</li>
                  </ol>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      <strong>Garanti:</strong> Hiçbir insan müdahalesi olmadan, tamamen algoritma ile belirlenir.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="withdrawal">
                <AccordionTrigger className="text-left">
                  Kazandığım ödülü nasıl çekerim?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ödül çekme işlemi otomatik olarak gerçekleşir:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>Çekiliş sonuçlandığında ödül otomatik olarak kazanan adrese gönderilir</li>
                    <li>İşlem tamamlandığında e-posta ve platform bildirimi alırsınız</li>
                    <li>Fonlarınızı Binance veya başka borsaya transfer edebilirsiniz</li>
                    <li>Borsada Türk Lirası'na çevirerek banka hesabınıza çekebilirsiniz</li>
                  </ol>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Önemli:</strong> Vergi yükümlülüklerinizi yerel vergi daireniz ile kontrol edin.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fees">
                <AccordionTrigger className="text-left">
                  Platform komisyonları nedir?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    DUXXAN şeffaf komisyon yapısı:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Çekilişler</h4>
                      <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                        <li>• Platform komisyonu: %5</li>
                        <li>• Blockchain gas fee: Değişken</li>
                        <li>• Minimum tutar: 0.01 BNB</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Bağışlar</h4>
                      <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                        <li>• Platform komisyonu: %2.5</li>
                        <li>• Blockchain gas fee: Değişken</li>
                        <li>• Minimum tutar: 0.001 BNB</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger className="text-left">
                  Fonlarım güvende mi?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    DUXXAN çoklu güvenlik katmanları kullanır:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li><strong>Smart Contract Güvenliği:</strong> Kodlar bağımsız denetimden geçmiştir</li>
                    <li><strong>Blockchain Şeffaflığı:</strong> Tüm işlemler herkese açık ve doğrulanabilir</li>
                    <li><strong>Kullanıcı Kontrolü:</strong> Fonlarınız size ait cüzdanda kalır</li>
                    <li><strong>Otomatik İşlemler:</strong> İnsan müdahalesi olmadan çalışır</li>
                  </ul>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Hatırlatma:</strong> Seed kelimelerinizi asla kimseyle paylaşmayın ve güvenli yerde saklayın.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Support Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-green-600" />
              <span>Destek Talebi Oluştur</span>
            </CardTitle>
            <CardDescription>
              Sorununuz FAQ'da yer almıyorsa, bizimle iletişime geçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={supportForm.category} onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sorun kategorisini seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet">Cüzdan Bağlantısı</SelectItem>
                      <SelectItem value="transaction">İşlem Sorunları</SelectItem>
                      <SelectItem value="raffle">Çekiliş Sorunları</SelectItem>
                      <SelectItem value="donation">Bağış Sorunları</SelectItem>
                      <SelectItem value="account">Hesap Sorunları</SelectItem>
                      <SelectItem value="security">Güvenlik</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Öncelik</Label>
                  <Select value={supportForm.priority} onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="urgent">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Konu</Label>
                <Input
                  id="subject"
                  placeholder="Sorunuzun kısa özeti"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Detaylı Açıklama</Label>
                <Textarea
                  id="message"
                  placeholder="Sorununuzu detaylı olarak açıklayın. Hangi adımları denediğinizi ve aldığınız hata mesajlarını belirtin."
                  rows={6}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black">
                Destek Talebi Gönder
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Yanıt Süreleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-center">
              <div className="flex justify-between">
                <span>Düşük Öncelik:</span>
                <Badge variant="secondary">2-3 gün</Badge>
              </div>
              <div className="flex justify-between">
                <span>Normal:</span>
                <Badge variant="secondary">24 saat</Badge>
              </div>
              <div className="flex justify-between">
                <span>Yüksek Öncelik:</span>
                <Badge variant="secondary">4-8 saat</Badge>
              </div>
              <div className="flex justify-between">
                <span>Acil:</span>
                <Badge variant="destructive">1-2 saat</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Direkt İletişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-center">
              <div>
                <strong>Genel Destek:</strong><br />
                support@duxxan.com
              </div>
              <div>
                <strong>Güvenlik:</strong><br />
                security@duxxan.com
              </div>
              <div>
                <strong>İş Geliştirme:</strong><br />
                business@duxxan.com
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Acil Durumlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-center">
              <p>Güvenlik ihlali veya kayıp fonlar için:</p>
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <strong>emergency@duxxan.com</strong><br />
                <span className="text-xs">24 saat yanıt garantili</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWithWallet>
  );
}