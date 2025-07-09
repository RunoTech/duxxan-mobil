import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { 
  Clock, 
  Users, 
  Heart, 
  Star, 
  TrendingUp, 
  MessageCircle,
  Share2,
  Target,
  Shield,
  Calendar,
  DollarSign,
  Wallet
} from 'lucide-react';
import { LightweightChart } from '@/components/ui/lightweight-chart';

export default function DonationDetail() {
  const { id } = useParams();
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState(10);

  const { data: donation, isLoading } = useQuery({
    queryKey: [`/api/donations/${id}`],
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  const { data: contributions } = useQuery({
    queryKey: [`/api/donations/${id}/contributions`],
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  // Mock chart data - bağış analizi
  const progressData = [
    { day: 'Pzt', amount: 45.5, donors: 12 },
    { day: 'Sal', amount: 89.2, donors: 23 },
    { day: 'Çar', amount: 156.8, donors: 34 },
    { day: 'Per', amount: 234.1, donors: 45 },
    { day: 'Cum', amount: 387.5, donors: 67 },
    { day: 'Cmt', amount: 523.2, donors: 89 },
    { day: 'Paz', amount: 687.5, donors: 156 },
  ];

  const hourlyDonations = [
    { hour: '09:00', amount: 23.5 },
    { hour: '10:00', amount: 45.2 },
    { hour: '11:00', amount: 67.8 },
    { hour: '12:00', amount: 89.1 },
    { hour: '13:00', amount: 112.4 },
    { hour: '14:00', amount: 98.6 },
    { hour: '15:00', amount: 134.2 },
    { hour: '16:00', amount: 156.7 },
    { hour: '17:00', amount: 187.3 },
    { hour: '18:00', amount: 203.9 },
  ];

  const donorDistribution = [
    { range: '0-25 USDT', count: 45 },
    { range: '25-50 USDT', count: 32 },
    { range: '50-100 USDT', count: 28 },
    { range: '100-250 USDT', count: 18 },
    { range: '250+ USDT', count: 7 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-duxxan-dark p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-duxxan-border rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-duxxan-border rounded"></div>
                <div className="h-64 bg-duxxan-border rounded"></div>
              </div>
              <div className="h-96 bg-duxxan-border rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const donationData = donation?.data;
  
  if (!donationData) {
    return (
      <div className="min-h-screen bg-duxxan-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-duxxan-text mb-2">Bağış Bulunamadı</h1>
          <p className="text-duxxan-text-secondary">Aradığınız bağış kampanyası mevcut değil.</p>
        </div>
      </div>
    );
  }

  const progress = (Number(donationData.currentAmount) / Number(donationData.goalAmount)) * 100;
  const timeLeft = new Date(donationData.endDate).getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-white dark:bg-duxxan-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {donationData.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {daysLeft} gün kaldı
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {donationData.donorCount} bağışçı
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {donationData.goalAmount} USDT hedef
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bağış İlerleme Analizi */}
            <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
                    Bağış İlerleme Analizi
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-duxxan-success/20 dark:text-duxxan-success">
                      Aktif
                    </Badge>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-600 dark:border-duxxan-success dark:text-duxxan-success">
                      7g: +{donationData.currentAmount} USDT
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Bağış Analizi</h3>
                    <p className="text-gray-600 dark:text-gray-300">Son 7 günde toplam {donationData.currentAmount} USDT bağış toplandı</p>
                  </div>
                </div>
                
                {/* İstatistikler */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-yellow-200 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{donationData.currentAmount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Toplanan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">%{progress.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Hedef</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{donationData.donorCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Bağışçı</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{daysLeft}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Gün Kaldı</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Saatlik Bağışlar */}
              <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Saatlik Bağışlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-center">
                      <Clock className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Saatlik Analiz</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">En yoğun bağış saatleri: 18:00-20:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bağışçı Dağılımı */}
              <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Bağışçı Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Bağışçı Analizi</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Toplam {donationData.donorCount} bağışçı katıldı</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Açıklama */}
            <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Bağış Kampanyası Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {donationData.description}
                </p>
                <Separator className="my-4 bg-yellow-200 dark:bg-gray-600" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Kampanya Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Hedef Tutar:</span>
                        <span className="text-green-600 dark:text-green-400">{donationData.goalAmount} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Toplanan:</span>
                        <span className="text-gray-900 dark:text-gray-100">{donationData.currentAmount} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Bitiş Tarihi:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {new Date(donationData.endDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Güvenlik & Şeffaflık</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Shield className="w-4 h-4" />
                        Blockchain Destekli
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Shield className="w-4 h-4" />
                        Şeffaf Harcama
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Shield className="w-4 h-4" />
                        Doğrudan Transfer
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Bağış Yap */}
            <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 dark:text-red-400" />
                  Bağış Yap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-gray-900 dark:text-gray-100">Bağış Tutarı (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="bg-white dark:bg-gray-800 border-yellow-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Hızlı Tutar Seçimi */}
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50, 100, 250, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setDonationAmount(amount)}
                      className="border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-white dark:border-gray-600 dark:text-gray-100 dark:hover:bg-yellow-500 dark:hover:text-gray-900"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-yellow-300 dark:border-gray-600">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Bağış Tutarı:</span>
                    <span className="text-gray-900 dark:text-gray-100">{donationAmount} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Platform Ücreti:</span>
                    <span className="text-gray-900 dark:text-gray-100">Ücretsiz</span>
                  </div>
                  <Separator className="my-2 bg-yellow-200 dark:bg-gray-600" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-gray-100">Toplam:</span>
                    <span className="text-yellow-600 dark:text-green-400">
                      {donationAmount.toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={async () => {
                    if (!isConnected) {
                      toast({
                        title: 'Cüzdan Bağlantısı Gerekli',
                        description: 'Bağış yapmak için önce cüzdanınızı bağlayın',
                        variant: 'destructive',
                      });
                      return;
                    }
                    
                    // Başarılı bağış simülasyonu
                    toast({
                      title: 'Bağış Başarılı!',
                      description: `${donationAmount} USDT bağışınız için teşekkürler`,
                    });
                  }}
                  className="w-full bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
                >
                  {isConnected ? 'Bağış Yap' : 'Cüzdan Bağlayın'}
                </Button>

                {!isConnected && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
                    Bağış yapmak için cüzdanınızı bağlamanız gerekmektedir.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* İlerleme */}
            <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Kampanya İlerlemesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {donationData.currentAmount} / {donationData.goalAmount} USDT
                    </span>
                    <span className="text-yellow-600 dark:text-green-400">%{progress.toFixed(1)}</span>
                  </div>
                  <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                    Hedefe {(Number(donationData.goalAmount) - Number(donationData.currentAmount)).toFixed(2)} USDT kaldı
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kampanya Sahibi */}
            <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Kampanya Sahibi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={donationData.creator?.profileImage} />
                    <AvatarFallback className="bg-yellow-500 dark:bg-green-600 text-white">
                      {donationData.creator?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {donationData.creator?.username}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {donationData.creator?.rating} ({donationData.creator?.ratingCount} değerlendirme)
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-white dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  İletişime Geç
                </Button>
              </CardContent>
            </Card>

            {/* Son Bağışçılar */}
            <Card className="bg-white dark:bg-duxxan-surface border-yellow-300 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Son Bağışçılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-yellow-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs">
                            B{i}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-900 dark:text-gray-100">donor_{i}...xyz</span>
                      </div>
                      <span className="text-xs text-yellow-600 dark:text-green-400 font-semibold">
                        {(Math.random() * 100 + 10).toFixed(2)} USDT
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}