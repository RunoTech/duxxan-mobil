import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DonationCard } from '@/components/DonationCard';
import { RaffleCard } from '@/components/RaffleCard';
import { Link } from 'wouter';
import { 
  MapPin, 
  Users, 
  Building2, 
  Heart, 
  TrendingUp, 
  Globe, 
  Award, 
  Shield,
  Star,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';

interface CountryData {
  code: string;
  name: string;
  flag: string;
  population: string;
  currency: string;
  language: string;
  description: string;
  stats: {
    totalCampaigns: number;
    totalDonations: string;
    totalRaffles: number;
    activeFoundations: number;
    activeAssociations: number;
    individuals: number;
  };
}

const countryData: Record<string, CountryData> = {
  'TUR': {
    code: 'TUR',
    name: 'Türkiye',
    flag: '🇹🇷',
    population: '84.7 milyon',
    currency: 'TRY',
    language: 'Türkçe',
    description: 'Türkiye, güçlü sivil toplum kuruluşları ve yardımlaşma kültürü ile öne çıkan bir ülkedir. Vakıflar ve dernekler aracılığıyla gerçekleştirilen bağış kampanyaları toplumsal dayanışmayı güçlendirmektedir.',
    stats: {
      totalCampaigns: 12,
      totalDonations: '125,450.50',
      totalRaffles: 8,
      activeFoundations: 15,
      activeAssociations: 23,
      individuals: 156
    }
  },
  'USA': {
    code: 'USA',
    name: 'Amerika Birleşik Devletleri',
    flag: '🇺🇸',
    population: '331.9 milyon',
    currency: 'USD',
    language: 'İngilizce',
    description: 'ABD, dünyanın en büyük bağış ekonomilerinden birine sahiptir. Binlerce vakıf ve kar amacı gütmeyen kuruluş aracılığıyla milyarlarca dolarlık bağış gerçekleştirilmektedir.',
    stats: {
      totalCampaigns: 45,
      totalDonations: '2,456,789.25',
      totalRaffles: 32,
      activeFoundations: 127,
      activeAssociations: 89,
      individuals: 1024
    }
  },
  'GER': {
    code: 'GER',
    name: 'Almanya',
    flag: '🇩🇪',
    population: '83.2 milyon',
    currency: 'EUR',
    language: 'Almanca',
    description: 'Almanya, sistematik ve şeffaf bağış kültürü ile tanınır. Sosyal sorumluluk projeleri ve uluslararası yardım kampanyalarında öncü rol oynamaktadır.',
    stats: {
      totalCampaigns: 28,
      totalDonations: '891,234.75',
      totalRaffles: 19,
      activeFoundations: 67,
      activeAssociations: 134,
      individuals: 445
    }
  }
};

export default function CountryProfile() {
  const [, params] = useRoute('/country/:countryCode');
  const countryCode = params?.countryCode?.toUpperCase() || 'TUR';
  const [activeTab, setActiveTab] = useState('overview');

  const country = countryData[countryCode] || countryData['TUR'];

  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ['/api/donations', { country: countryCode }],
    refetchInterval: 30000,
  });

  const { data: raffles, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/raffles', { country: countryCode }],
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-duxxan-page">
      <div className="container mx-auto px-4 py-8">
        {/* Country Header */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Header content */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="text-4xl sm:text-6xl flex-shrink-0">{country.flag}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl text-gray-900 dark:text-white font-bold">
                          {country.name}
                        </h1>
                        <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {country.code}
                        </Badge>
                        <a
                          href={`https://tr.wikipedia.org/wiki/${encodeURIComponent(country.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                          title="Wikipedia'da görüntüle"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.624 5.367 11.99 11.988 11.99s11.99-5.366 11.99-11.99C24.007 5.367 18.641.001 12.017.001zM8.232 10.855c0-.639.516-1.156 1.156-1.156.639 0 1.156.517 1.156 1.156 0 .639-.517 1.156-1.156 1.156-.64 0-1.156-.517-1.156-1.156zm7.524 0c0-.639.516-1.156 1.155-1.156.64 0 1.156.517 1.156 1.156 0 .639-.516 1.156-1.156 1.156-.639 0-1.155-.517-1.155-1.156zm-3.762 5.803c-2.189 0-3.975-1.786-3.975-3.975s1.786-3.975 3.975-3.975 3.975 1.786 3.975 3.975-1.786 3.975-3.975 3.975z"/>
                          </svg>
                          Wiki
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>👥 {country.population}</span>
                        <span>💰 {country.currency}</span>
                        <span>🗣️ {country.language}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                  <Link href="/create-donation" className="w-full sm:w-auto">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white w-full sm:w-auto text-sm px-3 py-2">
                      <Heart className="w-4 h-4 mr-2" />
                      Kampanya Başlat
                    </Button>
                  </Link>
                  <Link href="/create-raffle" className="w-full sm:w-auto">
                    <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white w-full sm:w-auto text-sm px-3 py-2">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Çekiliş Oluştur
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                {country.description}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-all">{country.stats.totalCampaigns}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Toplam Kampanya</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-all">{country.stats.totalDonations}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">USDT Bağış</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-all">{country.stats.totalRaffles}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Aktif Çekiliş</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-all">{country.stats.activeFoundations}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Vakıf</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-all">{country.stats.activeAssociations}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Dernek</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto mb-2" />
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-all">{country.stats.individuals}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bireysel</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Genel Bakış</span>
              <span className="sm:hidden">Genel</span>
            </TabsTrigger>
            <TabsTrigger 
              value="donations"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Heart className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Bağış Kampanyaları</span>
              <span className="sm:hidden">Bağış</span>
            </TabsTrigger>
            <TabsTrigger 
              value="raffles"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Award className="w-4 h-4 mr-1 sm:mr-2" />
              Çekilişler
            </TabsTrigger>
            <TabsTrigger 
              value="organizations"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <Building2 className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Organizasyonlar</span>
              <span className="sm:hidden">Org.</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Top Foundations */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    En Aktif Vakıflar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Eğitim Vakfı', campaigns: 8, donations: '45,230 USDT', rating: 4.9 },
                      { name: 'Sağlık Vakfı', campaigns: 6, donations: '38,750 USDT', rating: 4.8 },
                      { name: 'Çevre Vakfı', campaigns: 4, donations: '22,180 USDT', rating: 4.7 },
                    ].map((foundation, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{foundation.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{foundation.campaigns} kampanya • {foundation.donations}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{foundation.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Son Aktiviteler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'donation', title: 'Yeni bağış kampanyası', org: 'Eğitim Vakfı', time: '2 saat önce' },
                      { type: 'raffle', title: 'Çekiliş tamamlandı', org: 'Sağlık Derneği', time: '5 saat önce' },
                      { type: 'donation', title: '50,000 USDT hedefe ulaşıldı', org: 'Çevre Vakfı', time: '1 gün önce' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${activity.type === 'donation' ? 'bg-green-500' : 'bg-purple-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{activity.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.org} • {activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Heart className="w-5 h-5 text-red-500" />
                  {country.name} Bağış Kampanyaları
                  <Badge className="bg-red-100 text-red-800">{country.stats.totalCampaigns} Aktif</Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            
            {donationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : donations && donations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {donations.map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz {country.name} kampanyası bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {country.name} için ilk bağış kampanyasını siz başlatın!
                </p>
                <Link href="/create-donation">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Heart className="w-4 h-4 mr-2" />
                    İlk Kampanyayı Başlat
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          {/* Raffles Tab */}
          <TabsContent value="raffles" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Award className="w-5 h-5 text-purple-500" />
                  {country.name} Çekilişleri
                  <Badge className="bg-purple-100 text-purple-800">{country.stats.totalRaffles} Aktif</Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            
            {rafflesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : raffles && raffles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {raffles.map((raffle: any) => (
                  <RaffleCard key={raffle.id} raffle={raffle} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz {country.name} ödül havuzu bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {country.name} için ilk ödül havuzunu siz başlatın!
                </p>
                <Link href="/create-raffle">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Award className="w-4 h-4 mr-2" />
                    İlk Çekilişi Başlat
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Foundations */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    Vakıflar
                    <Badge className="bg-blue-100 text-blue-800">{country.stats.activeFoundations}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Eğitim Vakfı',
                      'Sağlık Vakfı', 
                      'Çevre Vakfı',
                      'Kültür Vakfı',
                      'Spor Vakfı'
                    ].map((foundation, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-white truncate">{foundation}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Doğrulanmış</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Associations */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5 text-green-500" />
                    Dernekler
                    <Badge className="bg-green-100 text-green-800">{country.stats.activeAssociations}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Yardımlaşma Derneği',
                      'Gençlik Derneği',
                      'Kadın Derneği',
                      'Engelliler Derneği',
                      'Yaşlılar Derneği'
                    ].map((association, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-white truncate">{association}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Doğrulanmış</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}