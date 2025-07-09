import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { Clock, Users, Heart, Target, Star, MapPin, Calendar, DollarSign, TrendingUp, Sparkles, HandHeart, Gift } from 'lucide-react';

interface DonationCardProps {
  donation: any;
  viewMode: 'grid' | 'list';
}

// Helper function to format currency
const formatCurrency = (value: string | number) => {
  const num = parseFloat(value.toString());
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num % 1 === 0) {
    return num.toString();
  } else {
    return num.toFixed(1);
  }
};

export function DonationCard({ donation, viewMode }: DonationCardProps) {
  const progress = donation?.goalAmount && donation?.currentAmount 
    ? (Number(donation.currentAmount) / Number(donation.goalAmount)) * 100 
    : 0;

  const timeLeft = donation?.endDate 
    ? new Date(donation.endDate).getTime() - new Date().getTime() 
    : 0;
  const daysLeft = timeLeft > 0 ? Math.ceil(timeLeft / (1000 * 60 * 60 * 24)) : 0;

  const isUrgent = daysLeft <= 7 && daysLeft > 0;

  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'US': 'Amerika',
      'GB': 'İngiltere',
      'FR': 'Fransa',
      'DE': 'Almanya',
      'IT': 'İtalya',
      'ES': 'İspanya',
      'JP': 'Japonya',
      'KR': 'Güney Kore',
      'CN': 'Çin',
      'RU': 'Rusya',
      'BR': 'Brezilya',
      'CA': 'Kanada',
      'AU': 'Avustralya',
      'IN': 'Hindistan',
      'MX': 'Meksika',
      'SA': 'Suudi Arabistan',
      'AE': 'BAE',
      'NL': 'Hollanda',
      'CH': 'İsviçre',
      'SE': 'İsveç',
      'NO': 'Norveç',
      'DK': 'Danimarka',
      'AT': 'Avusturya',
      'BE': 'Belçika',
      'FI': 'Finlandiya',
      'IE': 'İrlanda',
      'PT': 'Portekiz',
      'GR': 'Yunanistan',
      'PL': 'Polonya',
      'CZ': 'Çek Cumhuriyeti',
      'HU': 'Macaristan',
      'RO': 'Romanya',
      'BG': 'Bulgaristan',
      'HR': 'Hırvatistan',
      'SK': 'Slovakya',
      'SI': 'Slovenya',
      'LT': 'Litvanya',
      'LV': 'Letonya',
      'EE': 'Estonya',
      'MT': 'Malta',
      'CY': 'Kıbrıs',
      'LU': 'Lüksemburg',
      'IS': 'İzlanda',
      'LI': 'Liechtenstein',
      'MC': 'Monako',
      'SM': 'San Marino',
      'VA': 'Vatikan',
      'AD': 'Andorra'
    };
    return countries[countryCode] || countryCode;
  };

  if (viewMode === 'list') {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 card-animate rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Left side - Image/Icon */}
            <div className="flex-shrink-0 p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 p-6 pl-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/donations/${donation.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-green-500 transition-colors duration-200">
                        {donation.title}
                      </h3>
                    </Link>
                    {isUrgent && <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">🚨 URGENT</Badge>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {donation.description}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Hedef</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          ${Number(donation.goalAmount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Bağışçı</div>
                        <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {donation.donorCount} kişi
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Kalan</div>
                        <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {daysLeft} gün
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">İlerleme</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">%{progress.toFixed(1)}</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2 bg-gray-200 dark:bg-gray-700"
                    />
                  </div>
                </div>
                
                {/* Right side - Amount and Action */}
                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Toplanan</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${Number(donation.currentAmount).toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/donations/${donation.id}`}>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
                      Bağış Yap
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 card-animate group rounded-xl overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative">
          {/* Goal Amount Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
              ${Number(donation.goalAmount).toLocaleString()}
            </Badge>
          </div>
          
          {/* Urgent Badge */}
          {isUrgent && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                🚨 URGENT
              </Badge>
            </div>
          )}
          
          {/* Gradient Background */}
          <div className="h-32 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-t-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-center">
              <Heart className="w-12 h-12 text-white mb-1 mx-auto" />
              <div className="text-white/90 text-xs font-semibold">HELP NEEDED</div>
            </div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full animate-pulse-subtle"></div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <Link href={`/donations/${donation.id}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-green-500 transition-colors duration-200 line-clamp-2 mb-2 group-hover:text-green-500">
              {donation.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {donation.description}
          </p>
        </div>
        
        {/* Creator Info */}
        <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={donation.creator?.profileImage || ''} />
            <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold">
              {donation.creator?.name?.substring(0, 2) || 'UN'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {donation.creator?.name || 'Unknown'}
            </p>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getCountryName(donation.creator?.country || donation.country)}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">4.8</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(donation.currentAmount)} USDT
            </div>
            <div className="text-xs text-green-500 dark:text-green-400">
              Toplanan
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {donation.donorCount}
            </div>
            <div className="text-xs text-purple-500 dark:text-purple-400">
              Bağışçı
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {daysLeft}
            </div>
            <div className="text-xs text-orange-500 dark:text-orange-400">
              Gün Kaldı
            </div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">%{progress.toFixed(1)}</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          />
        </div>
        
        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs text-gray-500 dark:text-gray-400">Hedef Tutar</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ${Number(donation.goalAmount).toLocaleString()}
            </div>
          </div>
          <Link href={`/donations/${donation.id}`}>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg btn-animate">
              <HandHeart className="w-4 h-4 mr-2" />
              Bağış Yap
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default DonationCard;