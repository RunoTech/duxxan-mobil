import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { Clock, Users, Trophy, Star, MapPin, Calendar, DollarSign, Zap, Sparkles, TrendingUp, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface RaffleCardProps {
  raffle: any;
  viewMode: 'grid' | 'list';
}

export function RaffleCard({ raffle, viewMode }: RaffleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const progress = raffle?.ticketsSold && raffle?.maxTickets 
    ? (raffle.ticketsSold / raffle.maxTickets) * 100 
    : 0;

  const timeLeft = raffle?.endDate 
    ? new Date(raffle.endDate).getTime() - new Date().getTime() 
    : 0;
  const daysLeft = timeLeft > 0 ? Math.ceil(timeLeft / (1000 * 60 * 60 * 24)) : 0;

  const isHot = progress > 75 || daysLeft <= 3;

  // Get images array or default - handle both string and array formats
  let images = [];
  
  if (raffle?.images) {
    if (typeof raffle.images === 'string') {
      try {
        images = JSON.parse(raffle.images);
      } catch (e) {
        images = [];
      }
    } else if (Array.isArray(raffle.images)) {
      images = raffle.images;
    }
  }

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

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
            <div className="flex-shrink-0 p-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
                {images.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={images[currentImageIndex]} 
                      alt={raffle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500';
                      }}
                    />
                    {images.length > 1 && (
                      <>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all duration-200"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all duration-200"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                          {currentImageIndex + 1}/{images.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 p-6 pl-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/raffles/${raffle.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-colors duration-200">
                        {raffle.title}
                      </h3>
                    </Link>
                    {isHot && <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">🔥 HOT</Badge>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {raffle.description}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ödül</div>
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${Number(raffle.prizeValue).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Katılımcı</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {raffle.ticketsSold}/{raffle.maxTickets}
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
                
                {/* Right side - Price and Action */}
                <div className="flex flex-col items-end gap-3 ml-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Katılım Ücreti</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${Number(raffle.ticketPrice).toFixed(2)}
                    </div>
                  </div>
                  <Link href={`/raffles/${raffle.id}`}>
                    <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg btn-animate">
                      Havuza Katıl
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
          {/* Prize Value Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
              ${Number(raffle.prizeValue).toLocaleString()}
            </Badge>
          </div>
          
          {/* Hot Badge */}
          {isHot && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                🔥 POPÜLER
              </Badge>
            </div>
          )}
          
          {/* Image Carousel or Gradient Background */}
          <div className="h-32 rounded-t-xl relative overflow-hidden">
            {images.length > 0 ? (
              <div className="relative w-full h-full">
                <img 
                  src={images[currentImageIndex]} 
                  alt={raffle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500';
                  }}
                />
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full z-20">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
                
                {/* Overlay Content */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                  <div className="text-white">
                    <div className="text-white/90 text-sm font-semibold">GRAND PRIZE</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                  <Trophy className="w-20 h-20 text-white mb-2 mx-auto" />
                  <div className="text-white/90 text-sm font-semibold">GRAND PRIZE</div>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <Link href={`/raffles/${raffle.id}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-orange-500 transition-colors duration-200 line-clamp-2 mb-2 group-hover:text-orange-500">
              {raffle.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {raffle.description}
          </p>
        </div>
        
        {/* Creator Info */}
        <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={raffle.creator?.profileImage || ''} />
            <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold">
              {raffle.creator?.name?.substring(0, 2) || 'UN'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {raffle.creator?.name || 'Unknown'}
            </p>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getCountryName(raffle.creator?.country || raffle.country)}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">4.9</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {raffle.ticketsSold}
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-400">
              Satıldı
            </div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {raffle.maxTickets}
            </div>
            <div className="text-xs text-purple-500 dark:text-purple-400">
              Maksimum
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
            <div className="text-xs text-gray-500 dark:text-gray-400">Katılım Ücreti</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ${Number(raffle.ticketPrice).toFixed(2)}
            </div>
          </div>
          <Link href={`/raffles/${raffle.id}`}>
            <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg btn-animate">
              <Sparkles className="w-4 h-4 mr-2" />
              Havuza Katıl
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}