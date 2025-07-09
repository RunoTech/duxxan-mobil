import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { 
  Shield, 
  Globe, 
  TrendingUp, 
  Users, 
  Heart, 
  Gift, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Award,
  Lock,
  Coins,
  BarChart3,
  Timer,
  Target
} from 'lucide-react';

export default function Home() {
  const { isConnected } = useWallet();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch platform statistics with optimized queries
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: true
  });

  const { data: activeRafflesData } = useQuery({
    queryKey: ['/api/raffles/active'],
    queryFn: async () => {
      const response = await fetch('/api/raffles/active');
      const result = await response.json();
      console.log('Home API Response:', result);
      return result.data || result || [];
    },
    staleTime: 0, // No cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: true
  });

  const activeRaffles = activeRafflesData || [];

  const { data: activeDonationsData } = useQuery({
    queryKey: ['/api/donations/active'],
    queryFn: async () => {
      const response = await fetch('/api/donations/active');
      const result = await response.json();
      console.log('Donations API Response:', result);
      return result.data || result || [];
    },
    staleTime: 0, // No cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: true
  });

  const activeDonations = activeDonationsData || [];

  const heroSlides = [
    {
      title: "Blockchain Tabanlı Şeffaflık",
      subtitle: "Her işlem blockchain üzerinde doğrulanır",
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "Küresel Erişim",
      subtitle: "Dünya çapında bağış ve ödül havuzu platformu",
      icon: Globe,
      color: "text-blue-500"
    },
    {
      title: "Gerçek Zamanlı Güncellemeler",
      subtitle: "Canlı veriler ve anlık bildirimler",
      icon: Zap,
      color: "text-yellow-500"
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "Şeffaf Bağışlar",
      description: "Her bağış blockchain üzerinde takip edilebilir ve şeffaftır",
      stats: Array.isArray(activeDonations) ? activeDonations.length : 0
    },
    {
      icon: Gift,
      title: "Adil Ödül Havuzları",
      description: "Blockchain tabanlı rastgele sayı üretimi ile adil ödül dağıtımı",
      stats: Array.isArray(activeRaffles) ? activeRaffles.length : 0
    },
    {
      icon: Users,
      title: "Topluluk Odaklı",
      description: "Dernekler, vakıflar ve bireysel kampanyalar için platform",
      stats: "1000+"
    },
    {
      icon: Shield,
      title: "Güvenli İşlemler",
      description: "Smart contract tabanlı güvenli ödeme sistemi",
      stats: "100%"
    }
  ];

  // Format large numbers for better display
  const formatValue = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const platformStats = [
    {
      value: Array.isArray(activeRaffles) ? activeRaffles.length : 0,
      label: "Aktif Ödül Havuzları",
      icon: Gift,
      color: "text-purple-500"
    },
    {
      value: Array.isArray(activeDonations) ? activeDonations.length : 0,
      label: "Aktif Bağışlar",
      icon: Heart,
      color: "text-red-500"
    },
    {
      value: `${formatValue((stats as any)?.totalPrizePool || "0")} USDT`,
      label: "Toplam Ödül Havuzu",
      icon: Coins,
      color: "text-green-500"
    },
    {
      value: (stats as any)?.totalUsers || "500+",
      label: "Aktif Kullanıcı",
      icon: Users,
      color: "text-blue-500"
    }
  ];

  const advantages = [
    {
      icon: Lock,
      title: "Güvenlik",
      description: "Smart contract tabanlı güvenli işlemler"
    },
    {
      icon: BarChart3,
      title: "Şeffaflık",
      description: "Tüm işlemler blockchain üzerinde görülebilir"
    },
    {
      icon: Timer,
      title: "Hız",
      description: "Anında işlem onayları ve hızlı transferler"
    },
    {
      icon: Target,
      title: "Doğruluk",
      description: "Manipüle edilemeyen adil sistem"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-background dark:via-background dark:to-background py-6 overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          <div className="text-center">
            {/* Logo and Branding */}
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-sm sm:text-lg font-black text-white">D</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent leading-none">
                  DUXXAN
                </h1>
                <p className="text-xs font-medium text-muted-foreground tracking-wider mt-0.5">
                  BLOCKCHAIN PLATFORM
                </p>
              </div>
            </div>

            {/* Dynamic Features Showcase */}
            <div className="mb-3 sm:mb-4">
              <div className="inline-flex items-center gap-1 sm:gap-2 bg-background/80 backdrop-blur-lg rounded-full px-2 sm:px-3 py-1 sm:py-1.5 mb-2 sm:mb-3 shadow-lg border border-border">
                {heroSlides.map((slide, index) => {
                  const IconComponent = slide.icon;
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-700 ${
                        index === currentSlide
                          ? `${slide.color} scale-110 opacity-100`
                          : 'text-gray-400 scale-75 opacity-40'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  );
                })}
              </div>
              
              <div className="h-10 sm:h-12 md:h-14 mb-3 sm:mb-4 relative">
                {heroSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide 
                        ? 'opacity-100' 
                        : 'opacity-0'
                    }`}
                  >
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground mb-1 px-2 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium px-4 leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="max-w-4xl mx-auto mb-6 sm:mb-8 px-3">
              <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-4 sm:mb-6 leading-relaxed text-center">
                Dünya'nın en güvenli <span className="text-primary font-bold">blockchain tabanlı</span> 
                <br className="hidden xl:block" />
                bağış ve ödül havuzu platformu
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2 sm:mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">%100 Güvenli</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Smart contract koruması</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2 sm:mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">Küresel Erişim</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">7/24 her yerden erişim</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2 sm:mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">Şeffaf İşlemler</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Blockchain doğrulaması</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-6">
              {!isConnected ? (
                <div className="text-center px-4">
                  <WalletConnectButton 
                    size="default" 
                    className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg btn-animate w-full sm:w-auto" 
                  />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-3 font-medium">
                    Cüzdanınızı bağlayın ve hemen başlayın
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                  <Link href="/donations" className="w-full sm:w-auto">
                    <Button size="default" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg btn-animate w-full sm:w-auto">
                      <Heart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Bağış Kampanyaları
                    </Button>
                  </Link>
                  <Link href="/raffles" className="w-full sm:w-auto">
                    <Button size="default" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg btn-animate w-full sm:w-auto">
                      <Gift className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Ödül Havuzları
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-gray-200/30 dark:border-gray-700/30">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="font-medium text-sm sm:text-base">BSC Blockchain</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Doğrulanmış Kontrat</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">USDT Ödemeleri</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 text-sm font-bold">
              📊 PLATFORM VERİLERİ
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
              DUXXAN Ağı Büyüyor
            </h2>
            <p className="text-sm text-gray-300 max-w-2xl mx-auto">
              Küresel kullanıcıların güveniyle büyüyen, blockchain tabanlı şeffaf ekosistem
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {platformStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Card className="relative bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 rounded-2xl">
                    <CardContent className="p-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xl">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-sm sm:text-base font-black text-white mb-1 break-words">
                        {stat.value}
                      </div>
                      <div className="text-xs font-semibold text-gray-300 break-words">
                        {stat.label}
                      </div>
                      <div className="mt-2 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Live Activity Indicators */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl p-4 border border-green-400/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold">CANLI</span>
              </div>
              <h3 className="text-white font-bold text-base mb-2">Canlı Bağışlar</h3>
              <p className="text-gray-300 text-sm">{Array.isArray(activeDonations) ? activeDonations.length : 0} kampanya bağış kabul ediyor</p>
            </div>
            
            <div className="bg-purple-500/20 backdrop-blur-lg rounded-2xl p-4 border border-purple-400/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 font-bold">AKTIF</span>
              </div>
              <h3 className="text-white font-bold text-base mb-2">Aktif Ödül Havuzları</h3>
              <p className="text-gray-300 text-sm">{Array.isArray(activeRaffles) ? activeRaffles.length : 0} ödül havuzu bilet satışında</p>
            </div>
            
            <div className="bg-yellow-500/20 backdrop-blur-lg rounded-2xl p-4 border border-yellow-400/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 font-bold">GÜVENLİ</span>
              </div>
              <h3 className="text-white font-bold text-base mb-2">Blockchain Koruması</h3>
              <p className="text-gray-300 text-sm">Tüm işlemler BSC üzerinde doğrulanıyor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-[#1D2025] dark:via-[#2A2D35] dark:to-[#1D2025]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4 shadow-lg">
              <Star className="w-3 h-3" />
              BLOCKCHAIN AVANTAJLARI
              <Star className="w-3 h-3" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">
              Güvenli ve Şeffaf Sistem
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-medium">
              Geleneksel platformlardan farklı olarak, blockchain teknolojisini kullanarak 
              <span className="text-yellow-600 dark:text-yellow-400 font-bold"> tam şeffaflık</span> sağlıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Card className="relative bg-white/80 dark:bg-[#2A2D35]/80 backdrop-blur-lg border-2 border-white/50 dark:border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 transform group-hover:shadow-2xl rounded-2xl overflow-hidden">
                    <CardHeader className="text-center pb-2">
                      <div className="relative mx-auto w-12 h-12 mb-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                        <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center w-full h-full shadow-xl">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-black text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center px-4 pb-4">
                      <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-full font-black text-sm shadow-lg">
                        {feature.stats}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Trust Building Section */}
          <div className="mt-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative z-10">
              <Shield className="w-16 h-16 mx-auto mb-6" />
              <h3 className="text-3xl md:text-4xl font-black mb-6">
                %100 Güvenli ve Şeffaf İşlemler
              </h3>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Smart contract teknolojisi sayesinde her işlem blockchain üzerinde kayıtlı. 
                Hiçbir manipülasyon veya hile mümkün değil!
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">Doğrulanmış Kontrat</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">BSC Blockchain</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">USDT Ödemeleri</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-4 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars-pattern opacity-20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-2xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center mb-4">
            <Badge className="mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 text-xs font-bold">
              ⚡ KOLAY
            </Badge>
            <h2 className="text-lg md:text-xl font-black text-white mb-2">
              3 Adımda Başlayın
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-3">
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-xl font-black text-white">1</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-sm md:text-base font-black text-white mb-2">Cüzdan Bağlayın</h3>
              <p className="text-xs text-gray-300 max-w-xs mx-auto">
                MetaMask ile güvenli bağlantı
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-3">
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-xl font-black text-white">2</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-sm md:text-base font-black text-white mb-2">Kampanya Seçin</h3>
              <p className="text-xs text-gray-300 max-w-xs mx-auto">
                Blockchain korumalı kampanyalar
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-3">
                <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-xl font-black text-white">3</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-sm md:text-base font-black text-white mb-2">İşlem Yapın</h3>
              <p className="text-xs text-gray-300 max-w-xs mx-auto">
                USDT ile güvenli ödeme
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="mb-4">
            <Badge className="mb-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 text-xs font-black">
              🚀 BLOCKCHAIN
            </Badge>
            <h2 className="text-lg md:text-xl font-black text-white mb-2">
              Güvenli Geleceğe Katılın
            </h2>
          </div>

          {/* Main CTA */}
          <div className="space-y-4">
            {!isConnected ? (
              <div className="space-y-3">
                <WalletConnectButton 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-black shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                />
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/donations">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-2 border-white/50 text-white hover:bg-white/20 backdrop-blur-lg px-6 py-3 text-sm font-bold rounded-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Bağış Kampanyaları
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/raffles">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-2 border-white/50 text-white hover:bg-white/20 backdrop-blur-lg px-6 py-3 text-sm font-bold rounded-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Ödül Havuzları
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-3 border border-green-400/30 inline-block">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-bold text-sm">Cüzdanınız Bağlı!</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/donations">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-black shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Bağış Kampanyaları
                    </Button>
                  </Link>
                  <Link href="/raffles">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 text-lg font-black shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      Ödül Havuzları
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex flex-wrap justify-center items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-white font-bold text-xs">BSC</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-bold text-xs">Smart Contract</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-3 py-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-bold text-xs">USDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}