import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Users, Plus, Bell, Calendar, Trophy, Eye, Heart, Share2, Search, Filter, CheckCircle, Edit, Globe, Tag, Sparkles, ChevronDown, DollarSign, Ticket, Hash, Clock, User, ExternalLink, Gift, MessageCircle, Star } from 'lucide-react';
import DonationCard from '@/components/DonationCard';
import CorporateFundCard from '@/components/CorporateFundCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Countdown hook
const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// Helper function to format numbers
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

// Raffle Card Component
const RaffleCard = ({ raffle, isInterested, onToggleInterest }: { 
  raffle: any; 
  isInterested: boolean; 
  onToggleInterest: (raffleId: number) => void; 
}) => {
  const countdown = useCountdown(raffle.startDate);

  const handleReminder = () => {
    onToggleInterest(raffle.id);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-[#FFC929] transition-all duration-300 rounded-xl overflow-hidden w-full min-h-[320px] flex flex-col">
      <CardHeader className="p-3 flex-shrink-0">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-[#FFC929] text-black font-bold text-xs">
                {raffle.creator?.username?.charAt(0).toUpperCase() || 'R'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-gray-900 dark:text-white text-sm font-bold truncate leading-tight">
                {raffle.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-xs truncate mt-0.5">
                @{raffle.creator?.username || 'anonim'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Badge className="bg-[#FFC929] text-black px-1.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap">
              {raffle.category?.name || 'Genel'}
            </Badge>
            <Badge className="bg-emerald-600 text-white px-1.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap">
              Yakında
            </Badge>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2 mb-2 leading-relaxed">
          {raffle.description}
        </p>
      </CardHeader>
      
      <CardContent className="p-3 pt-0 flex-1 flex flex-col">
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <DollarSign className="h-3 w-3 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs font-medium">Ödül:</span>
            </div>
            <span className="text-[#FFC929] font-bold text-sm truncate ml-2">
              {formatCurrency(raffle.prizeValue)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Ticket className="h-3 w-3 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs font-medium">Bilet:</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-xs truncate ml-2">
              {formatCurrency(raffle.ticketPrice)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <Hash className="h-3 w-3 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs font-medium">Max:</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-xs truncate ml-2">
              {formatCurrency(raffle.maxTickets)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Başlangıç:</span>
            <span className="text-gray-900 dark:text-white font-medium text-xs truncate ml-2">
              {new Date(raffle.startDate).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 flex-shrink-0">
            <Heart className="h-3 w-3" />
            <span className="text-xs">{raffle.interestedCount || 0} ilgilenen</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className={`transition-all duration-200 text-xs px-2 py-1 flex-shrink-0 ${
              isInterested 
                ? 'bg-[#FFC929] text-black border-[#FFC929] hover:bg-[#FFD700]' 
                : 'border-[#FFC929] text-[#FFC929] bg-transparent raffle-button-hover'
            }`}
            onClick={handleReminder}
          >
            <Bell className="h-3 w-3 mr-1" />
            Hatırlat
          </Button>
        </div>
        
        {/* Countdown Timer */}
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2 border border-gray-300 dark:border-gray-600 mt-auto">
          <div className="flex justify-center space-x-2">
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm leading-tight">
                {countdown.days.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Gün</div>
            </div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm leading-tight">
                {countdown.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Saat</div>
            </div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm leading-tight">
                {countdown.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Dakika</div>
            </div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm leading-tight">
                {countdown.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Saniye</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const createChannelSchema = z.object({
  name: z.string().min(3, 'Kanal adı en az 3 karakter olmalı').max(50, 'Kanal adı en fazla 50 karakter olabilir'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı').max(500, 'Açıklama en fazla 500 karakter olabilir'),
  categoryId: z.number().min(1, 'Kategori seçimi zorunlu'),
});

const createUpcomingRaffleSchema = z.object({
  title: z.string().min(5, 'Başlık en az 5 karakter olmalı'),
  description: z.string().min(20, 'Açıklama en az 20 karakter olmalı'),
  prizeValue: z.string().min(1, 'Ödül değeri gerekli'),
  ticketPrice: z.string().min(1, 'Bilet fiyatı gerekli'),
  maxTickets: z.string().min(1, 'Maksimum bilet sayısı gerekli'),
  startDate: z.string().min(1, 'Başlangıç tarihi gerekli'),
  categoryId: z.number().min(1, 'Kategori seçimi zorunlu'),
});

type CreateChannelForm = z.infer<typeof createChannelSchema>;
type CreateUpcomingRaffleForm = z.infer<typeof createUpcomingRaffleSchema>;

// Countries list for selection
const countries = [
  { value: 'TR', label: '🇹🇷 Türkiye' },
  { value: 'US', label: '🇺🇸 Amerika Birleşik Devletleri' },
  { value: 'DE', label: '🇩🇪 Almanya' },
  { value: 'FR', label: '🇫🇷 Fransa' },
  { value: 'GB', label: '🇬🇧 Birleşik Krallık' },
  { value: 'IT', label: '🇮🇹 İtalya' },
  { value: 'ES', label: '🇪🇸 İspanya' },
  { value: 'NL', label: '🇳🇱 Hollanda' },
  { value: 'BE', label: '🇧🇪 Belçika' },
  { value: 'AT', label: '🇦🇹 Avusturya' },
  { value: 'CH', label: '🇨🇭 İsviçre' },
  { value: 'SE', label: '🇸🇪 İsveç' },
  { value: 'NO', label: '🇳🇴 Norveç' },
  { value: 'DK', label: '🇩🇰 Danimarka' },
  { value: 'FI', label: '🇫🇮 Finlandiya' },
  { value: 'PL', label: '🇵🇱 Polonya' },
  { value: 'CZ', label: '🇨🇿 Çek Cumhuriyeti' },
  { value: 'HU', label: '🇭🇺 Macaristan' },
  { value: 'GR', label: '🇬🇷 Yunanistan' },
  { value: 'PT', label: '🇵🇹 Portekiz' },
  { value: 'IE', label: '🇮🇪 İrlanda' },
  { value: 'LU', label: '🇱🇺 Lüksemburg' },
  { value: 'MT', label: '🇲🇹 Malta' },
  { value: 'CY', label: '🇨🇾 Kıbrıs' },
  { value: 'CA', label: '🇨🇦 Kanada' },
  { value: 'AU', label: '🇦🇺 Avustralya' },
  { value: 'NZ', label: '🇳🇿 Yeni Zelanda' },
  { value: 'JP', label: '🇯🇵 Japonya' },
  { value: 'KR', label: '🇰🇷 Güney Kore' },
  { value: 'SG', label: '🇸🇬 Singapur' },
  { value: 'AE', label: '🇦🇪 Birleşik Arap Emirlikleri' },
  { value: 'SA', label: '🇸🇦 Suudi Arabistan' },
  { value: 'QA', label: '🇶🇦 Katar' },
  { value: 'KW', label: '🇰🇼 Kuveyt' },
  { value: 'BH', label: '🇧🇭 Bahreyn' },
  { value: 'OM', label: '🇴🇲 Umman' },
  { value: 'GLOBAL', label: '🌍 Küresel' }
];

export default function Community() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'channels' | 'upcoming'>('channels');
  const [contentType, setContentType] = useState<'raffles' | 'donations' | 'corporate-funds'>('raffles');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateRaffle, setShowCreateRaffle] = useState(false);
  const [showEditChannel, setShowEditChannel] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [subscribedChannels, setSubscribedChannels] = useState<number[]>([2]);
  const [interestedRaffles, setInterestedRaffles] = useState<number[]>([]);
  
  // Subscription states for new functionality
  const [subscriptions, setSubscriptions] = useState<Set<number>>(new Set());
  const [memberCounts, setMemberCounts] = useState<Record<number, number>>({});

  const channelForm = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: undefined,
    },
  });

  const editChannelForm = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: undefined,
    },
  });

  const raffleForm = useForm<CreateUpcomingRaffleForm>({
    resolver: zodResolver(createUpcomingRaffleSchema),
    defaultValues: {
      title: '',
      description: '',
      prizeValue: '',
      ticketPrice: '',
      maxTickets: '',
      startDate: '',
      categoryId: 0,
    },
  });

  // Fetch channels from database with optimized caching
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/channels'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: true
  });

  const channels = (channelsData as any)?.data || [];

  // Fetch upcoming raffles from database with caching
  const { data: upcomingRafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/upcoming-raffles'],
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    enabled: true
  });

  const upcomingRaffles = Array.isArray(upcomingRafflesData) ? upcomingRafflesData : [];

  // Fetch donations from database with caching
  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['/api/donations/active'],
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    enabled: true
  });

  const donations = (donationsData as any)?.data || [];

  // Fetch corporate funds from database with caching
  const { data: corporateFundsData, isLoading: corporateFundsLoading } = useQuery({
    queryKey: ['/api/corporate-funds/active'],
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    enabled: true
  });

  const corporateFunds = (corporateFundsData as any)?.data || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch categories from database with long caching
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: true
  });

  const categories = [
    { id: 'all', name: 'Tüm Kategoriler' },
    ...(Array.isArray(categoriesData) ? categoriesData : []).map((cat: any) => ({
      id: cat.id.toString(),
      name: cat.name
    }))
  ];

  // Define countries array
  const countries = [
    { value: 'all', label: 'Tüm Ülkeler' },
    { value: 'TUR', label: '🇹🇷 Türkiye' },
    { value: 'USA', label: '🇺🇸 Amerika Birleşik Devletleri' },
    { value: 'GER', label: '🇩🇪 Almanya' },
    { value: 'FR', label: '🇫🇷 Fransa' },
    { value: 'GB', label: '🇬🇧 Birleşik Krallık' },
    { value: 'IT', label: '🇮🇹 İtalya' },
    { value: 'ES', label: '🇪🇸 İspanya' },
    { value: 'NL', label: '🇳🇱 Hollanda' },
    { value: 'BE', label: '🇧🇪 Belçika' },
    { value: 'CH', label: '🇨🇭 İsviçre' },
    { value: 'AT', label: '🇦🇹 Avusturya' },
    { value: 'SE', label: '🇸🇪 İsveç' },
    { value: 'NO', label: '🇳🇴 Norveç' },
    { value: 'DK', label: '🇩🇰 Danimarka' },
    { value: 'FI', label: '🇫🇮 Finlandiya' },
    { value: 'RU', label: '🇷🇺 Rusya' },
    { value: 'CN', label: '🇨🇳 Çin' },
    { value: 'JP', label: '🇯🇵 Japonya' },
    { value: 'KR', label: '🇰🇷 Güney Kore' },
    { value: 'IN', label: '🇮🇳 Hindistan' },
    { value: 'PK', label: '🇵🇰 Pakistan' },
    { value: 'BD', label: '🇧🇩 Bangladeş' },
    { value: 'ID', label: '🇮🇩 Endonezya' },
    { value: 'MY', label: '🇲🇾 Malezya' },
    { value: 'TH', label: '🇹🇭 Tayland' },
    { value: 'VN', label: '🇻🇳 Vietnam' },
    { value: 'PH', label: '🇵🇭 Filipinler' },
    { value: 'SG', label: '🇸🇬 Singapur' },
    { value: 'AE', label: '🇦🇪 Birleşik Arap Emirlikleri' },
    { value: 'SA', label: '🇸🇦 Suudi Arabistan' },
    { value: 'IR', label: '🇮🇷 İran' },
    { value: 'IQ', label: '🇮🇶 Irak' },
    { value: 'SY', label: '🇸🇾 Suriye' },
    { value: 'LB', label: '🇱🇧 Lübnan' },
    { value: 'JO', label: '🇯🇴 Ürdün' },
    { value: 'IL', label: '🇮🇱 İsrail' },
    { value: 'EG', label: '🇪🇬 Mısır' },
    { value: 'LY', label: '🇱🇾 Libya' },
    { value: 'TN', label: '🇹🇳 Tunus' },
    { value: 'DZ', label: '🇩🇿 Cezayir' },
    { value: 'MA', label: '🇲🇦 Fas' },
    { value: 'NG', label: '🇳🇬 Nijerya' },
    { value: 'ZA', label: '🇿🇦 Güney Afrika' },
    { value: 'KE', label: '🇰🇪 Kenya' },
    { value: 'ET', label: '🇪🇹 Etiyopya' },
    { value: 'GH', label: '🇬🇭 Gana' },
    { value: 'BR', label: '🇧🇷 Brezilya' },
    { value: 'MX', label: '🇲🇽 Meksika' },
    { value: 'AR', label: '🇦🇷 Arjantin' },
    { value: 'CL', label: '🇨🇱 Şili' },
    { value: 'CO', label: '🇨🇴 Kolombiya' },
    { value: 'PE', label: '🇵🇪 Peru' },
    { value: 'VE', label: '🇻🇪 Venezuela' },
    { value: 'UY', label: '🇺🇾 Uruguay' },
    { value: 'PY', label: '🇵🇾 Paraguay' },
    { value: 'BO', label: '🇧🇴 Bolivya' },
    { value: 'EC', label: '🇪🇨 Ekvador' },
    { value: 'CA', label: '🇨🇦 Kanada' },
    { value: 'AU', label: '🇦🇺 Avustralya' },
    { value: 'NZ', label: '🇳🇿 Yeni Zelanda' },
    { value: 'PL', label: '🇵🇱 Polonya' },
    { value: 'CZ', label: '🇨🇿 Çek Cumhuriyeti' },
    { value: 'SK', label: '🇸🇰 Slovakya' },
    { value: 'HU', label: '🇭🇺 Macaristan' },
    { value: 'RO', label: '🇷🇴 Romanya' },
    { value: 'BG', label: '🇧🇬 Bulgaristan' },
    { value: 'HR', label: '🇭🇷 Hırvatistan' },
    { value: 'RS', label: '🇷🇸 Sırbistan' },
    { value: 'BA', label: '🇧🇦 Bosna Hersek' },
    { value: 'MK', label: '🇲🇰 Kuzey Makedonya' },
    { value: 'ME', label: '🇲🇪 Karadağ' },
    { value: 'AL', label: '🇦🇱 Arnavutluk' },
    { value: 'GR', label: '🇬🇷 Yunanistan' },
    { value: 'CY', label: '🇨🇾 Kıbrıs' },
    { value: 'MT', label: '🇲🇹 Malta' },
    { value: 'IS', label: '🇮🇸 İzlanda' },
    { value: 'IE', label: '🇮🇪 İrlanda' },
    { value: 'PT', label: '🇵🇹 Portekiz' },
    { value: 'LU', label: '🇱🇺 Lüksemburg' },
    { value: 'LI', label: '🇱🇮 Liechtenstein' },
    { value: 'MC', label: '🇲🇨 Monako' },
    { value: 'AD', label: '🇦🇩 Andorra' },
    { value: 'SM', label: '🇸🇲 San Marino' },
    { value: 'VA', label: '🇻🇦 Vatikan' },
    { value: 'UA', label: '🇺🇦 Ukrayna' },
    { value: 'BY', label: '🇧🇾 Belarus' },
    { value: 'LT', label: '🇱🇹 Litvanya' },
    { value: 'LV', label: '🇱🇻 Letonya' },
    { value: 'EE', label: '🇪🇪 Estonya' },
    { value: 'GE', label: '🇬🇪 Gürcistan' },
    { value: 'AM', label: '🇦🇲 Ermenistan' },
    { value: 'AZ', label: '🇦🇿 Azerbaycan' },
    { value: 'KZ', label: '🇰🇿 Kazakistan' },
    { value: 'UZ', label: '🇺🇿 Özbekistan' },
    { value: 'TM', label: '🇹🇲 Türkmenistan' },
    { value: 'TJ', label: '🇹🇯 Tacikistan' },
    { value: 'KG', label: '🇰🇬 Kırgızistan' },
    { value: 'MN', label: '🇲🇳 Moğolistan' },
    { value: 'AF', label: '🇦🇫 Afganistan' },
    { value: 'NP', label: '🇳🇵 Nepal' },
    { value: 'BT', label: '🇧🇹 Butan' },
    { value: 'LK', label: '🇱🇰 Sri Lanka' },
    { value: 'MV', label: '🇲🇻 Maldivler' },
  ];

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(country => 
      country.label.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

  // Filtered channels based on search, category, and country
  const filteredChannels = useMemo(() => {
    return channels.filter((channel: any) => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || channel.categoryId === parseInt(selectedCategory);
      const matchesCountry = selectedCountry === 'all' || channel.country === selectedCountry;
      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [channels, searchQuery, selectedCategory, selectedCountry]);

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: CreateChannelForm) => {
      const response = await apiRequest('POST', '/api/channels', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kanal başarıyla oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      setShowCreateChannel(false);
      channelForm.reset();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Kanal oluşturulurken bir hata oluştu";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Edit channel mutation
  const editChannelMutation = useMutation({
    mutationFn: async (data: CreateChannelForm) => {
      const response = await apiRequest('PUT', `/api/channels/${editingChannel.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kanal başarıyla güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      setShowEditChannel(false);
      setEditingChannel(null);
      editChannelForm.reset();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.status === 403 
        ? "Bu kanalı düzenleme yetkiniz yok. Sadece kanal yaratıcısı düzenleyebilir."
        : "Kanal güncellenirken bir hata oluştu";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Create upcoming raffle mutation
  const createUpcomingRaffleMutation = useMutation({
    mutationFn: async (data: CreateUpcomingRaffleForm) => {
      const response = await apiRequest('POST', '/api/upcoming-raffles', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Gelecek çekiliş duyurusu oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-raffles'] });
      setShowCreateRaffle(false);
      raffleForm.reset();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Çekiliş duyurusu oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Subscribe/Unsubscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ channelId, action }: { channelId: number; action: 'subscribe' | 'unsubscribe' }) => {
      const method = action === 'subscribe' ? 'POST' : 'DELETE';
      const response = await apiRequest(method, `/api/channels/${channelId}/subscribe`);
      return response.json();
    },
    onSuccess: (_, { channelId, action }) => {
      if (action === 'subscribe') {
        setSubscribedChannels(prev => [...prev, channelId]);
        toast({
          title: "Başarılı",
          description: "Kanala abone oldunuz",
        });
      } else {
        setSubscribedChannels(prev => prev.filter(id => id !== channelId));
        toast({
          title: "Başarılı",
          description: "Kanal aboneliğiniz iptal edildi",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Handle raffle interest toggle
  const handleToggleRaffleInterest = async (raffleId: number) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Hatırlatma için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyInterested = interestedRaffles.includes(raffleId);
      const action = isCurrentlyInterested ? 'remove' : 'add';
      
      const response = await apiRequest('POST', `/api/upcoming-raffles/${raffleId}/reminder`, { action });
      
      if (response.ok) {
        if (isCurrentlyInterested) {
          setInterestedRaffles(prev => prev.filter(id => id !== raffleId));
          toast({
            title: "Başarılı",
            description: "Hatırlatma iptal edildi",
          });
        } else {
          setInterestedRaffles(prev => [...prev, raffleId]);
          toast({
            title: "Başarılı",
            description: "Hatırlatma ayarlandı!",
          });
        }
        queryClient.invalidateQueries({ queryKey: ['/api/upcoming-raffles'] });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = (channelId: number) => {
    if (!isConnected) {
      return;
    }

    const isCurrentlySubscribed = subscriptions.has(channelId);
    const newSubscriptions = new Set(subscriptions);
    const currentCount = memberCounts[channelId] ?? parseInt(channels?.find(c => c.id === channelId)?.subscriberCount || '0');
    
    if (isCurrentlySubscribed) {
      newSubscriptions.delete(channelId);
      setMemberCounts(prev => ({
        ...prev,
        [channelId]: Math.max(0, currentCount - 1)
      }));
    } else {
      newSubscriptions.add(channelId);
      setMemberCounts(prev => ({
        ...prev,
        [channelId]: currentCount + 1
      }));
    }
    
    setSubscriptions(newSubscriptions);
    
    // Keep legacy state in sync and make API call
    const action = subscribedChannels.includes(channelId) ? 'unsubscribe' : 'subscribe';
    setSubscribedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
    subscribeMutation.mutate({ channelId, action });
  };

  const handleEditChannel = (channel: any) => {
    setEditingChannel(channel);
    editChannelForm.reset({
      name: channel.name,
      description: channel.description,
      categoryId: channel.categoryId,
    });
    setShowEditChannel(true);
  };

  const onSubmitChannel = async (data: CreateChannelForm) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Kanal oluşturmak için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }
    
    createChannelMutation.mutate(data);
  };

  const onSubmitEditChannel = async (data: CreateChannelForm) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Kanal düzenlemek için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }
    editChannelMutation.mutate(data);
  };

  const onSubmitRaffle = async (data: CreateUpcomingRaffleForm) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Çekiliş duyurusu oluşturmak için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }
    createUpcomingRaffleMutation.mutate(data);
  };

  const CategorySelect = ({ field, categories }: { field: any; categories: any[] }) => (
    <select
      {...field}
      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
      value={field.value}
      className="w-full p-3 bg-duxxan-card border border-duxxan-border rounded-md text-white"
    >
      <option value={0}>Kategori seçin</option>
      {categories.filter(cat => cat.id !== 'all').map((category: any) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );

  const ChannelCard = ({ channel }: { channel: any }) => {
    // Debug wallet comparison
    console.log('Channel:', channel.id, 'Creator:', channel.creatorWalletAddress, 'Current:', address);
    const isOwner = isConnected && address && channel.creatorWalletAddress && 
                   address.toLowerCase() === channel.creatorWalletAddress.toLowerCase();
    const isSubscribed = subscriptions.has(channel.id);
    console.log('Is owner:', isOwner);

    const getCategoryInfo = (channel: any) => {
      if (channel.name?.toLowerCase().includes('crypto')) return { name: 'Kripto', color: 'bg-blue-600', tags: ['BTC', 'ETH', 'Analiz'] };
      if (channel.name?.toLowerCase().includes('nft')) return { name: 'NFT', color: 'bg-purple-600', tags: ['NFT', 'Art', 'Collectibles'] };
      if (channel.name?.toLowerCase().includes('defi')) return { name: 'DeFi', color: 'bg-green-600', tags: ['DeFi', 'Yield', 'Staking'] };
      return { name: 'Kripto', color: 'bg-blue-600', tags: ['BTC', 'ETH', 'Analiz'] };
    };

    const categoryInfo = getCategoryInfo(channel);
    const memberCount = memberCounts[channel.id] ?? (channel.subscriberCount ? parseInt(channel.subscriberCount) : Math.floor(Math.random() * 20000) + 1000);
    const activeCount = Math.floor(memberCount * 0.05) + Math.floor(Math.random() * 100);

    return (
    <Card 
      key={channel.id}
      className="group bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#FFC929] hover:shadow-lg hover:shadow-[#FFC929]/20 dark:hover:shadow-[#FFC929]/30 transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden flex flex-col relative h-96"
      onClick={() => setLocation(`/community/${channel.id}`)}
    >
      {/* Header Section */}
      <div className="relative">
        <div className="flex items-center justify-between p-3">
          {/* Channel Name */}
          <div className="bg-gradient-to-br from-[#FFC929] via-[#FFD700] to-[#FFB800] rounded-lg px-3 py-2 mr-2">
            <h3 className="text-gray-900 dark:text-gray-900 text-sm font-bold whitespace-nowrap">
              {channel.name}
            </h3>
          </div>
          
          {/* Actions */}
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditChannel(channel);
              }}
              className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200/50 dark:border-gray-600/50 flex-shrink-0"
            >
              <Edit className="h-4 w-4 text-gray-800 dark:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {channel.description || "Join our vibrant community of blockchain enthusiasts, developers, and investors"}
        </p>

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/api/placeholder/48/48`} />
            <AvatarFallback className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] text-black dark:text-black font-bold text-xs">
              {channel.creator?.username?.charAt(0)?.toUpperCase() || channel.name?.charAt(0)?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-gray-800 dark:text-white text-sm font-medium">
              {channel.creator?.username || 'CryptoExpert'}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              Topluluk Sahibi
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {categoryInfo.tags.map((tag, index) => (
            <Badge key={index} className="bg-[#FFC929]/20 dark:bg-[#FFC929]/20 text-[#FFC929] dark:text-[#FFC929] border-[#FFC929]/30 dark:border-[#FFC929]/30 text-xs px-2 py-1">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(memberCount)}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Üye</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Aktif</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#FFC929] dark:text-[#FFC929]">{categoryInfo.name}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Kategori</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center gap-1 mb-3">
          <Globe className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400 text-xs">Türkiye</span>
        </div>

        {/* Subscribe Button */}
        <div className="mt-auto">
          <Button
            className={`w-full font-semibold py-2 rounded-xl border-0 transition-all ${
              isSubscribed 
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white dark:text-white' 
                : 'bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] dark:from-[#FFC929] dark:to-[#FFB800] dark:hover:from-[#FFB800] dark:hover:to-[#FFA500] text-black dark:text-black'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleSubscribe(channel.id);
            }}
          >
            {isSubscribed ? 'Abone Olundu' : 'Abone Ol'}
          </Button>
        </div>
      </div>
    </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFC929] via-[#FFD700] to-[#FFB800] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-black/10 dark:from-[#FFC929]/10 dark:via-[#FFD700]/5 dark:to-[#FFB800]/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[#FFC929]/20 rounded-full border border-[#FFC929]/30 backdrop-blur-sm">
            <Users className="h-4 w-4 text-[#FFC929]" />
            <span className="text-[#FFC929] text-sm font-medium">TOPLULUK</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white mb-4">
            DUXXAN Topluluk
          </h1>
          
          <p className="text-xl text-gray-800 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">Blockchain topluluklarına katıl, ödül havuzlarını takip et ve birlikte kazan</p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-[#FFC929]/20 rounded-2xl p-6 backdrop-blur-sm">
              <Users className="h-8 w-8 text-[#FFC929] mx-auto mb-3" />
              <div className="text-3xl font-bold text-black dark:text-white mb-1">127</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">Aktif Topluluk</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-[#FFC929]/20 rounded-2xl p-6 backdrop-blur-sm">
              <Trophy className="h-8 w-8 text-[#FFC929] mx-auto mb-3" />
              <div className="text-3xl font-bold text-black dark:text-white mb-1">45K+</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">Toplam Üye</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-[#FFC929]/20 rounded-2xl p-6 backdrop-blur-sm">
              <Gift className="h-8 w-8 text-[#FFC929] mx-auto mb-3" />
              <div className="text-3xl font-bold text-black dark:text-white mb-1">89</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">Aktif Çekiliş</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-[#FFC929]/20 rounded-2xl p-6 backdrop-blur-sm">
              <MessageCircle className="h-8 w-8 text-[#FFC929] mx-auto mb-3" />
              <div className="text-3xl font-bold text-black dark:text-white mb-1">2.1K</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">Günlük Mesaj</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-5 w-5 mr-2" />
                  Topluluk Oluştur
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
      <div className="container mx-auto px-4 py-8">



        {/* Content Type Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-8 border border-gray-200/50 dark:border-[#FFC929]/30 shadow-lg">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setContentType('raffles')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                contentType === 'raffles'
                  ? 'bg-gradient-to-r from-[#FFC929] to-[#FFB800] text-black shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Trophy className="h-5 w-5 inline mr-2" />
              Ödül Havuzları
            </button>
            <button
              onClick={() => setContentType('donations')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                contentType === 'donations'
                  ? 'bg-gradient-to-r from-[#FFC929] to-[#FFB800] text-black shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Heart className="h-5 w-5 inline mr-2" />
              Bağış Kampanyaları
            </button>
            <button
              onClick={() => setContentType('corporate-funds')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                contentType === 'corporate-funds'
                  ? 'bg-gradient-to-r from-[#FFC929] to-[#FFB800] text-black shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <DollarSign className="h-5 w-5 inline mr-2" />
              Kurumsal Fonlar
            </button>
          </div>
          
          {/* Search specific to content type */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder={
                  contentType === 'raffles' ? 'Ödül havuzu ara...' :
                  contentType === 'donations' ? 'Bağış kampanyası ara...' :
                  'Kurumsal fon ara...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#FFC929] focus:ring-2 focus:ring-[#FFC929]/30 rounded-lg"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36 h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:border-[#FFC929] focus:ring-2 focus:ring-[#FFC929]/30 rounded-lg">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                <SelectItem value="all" className="text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Tüm Kategoriler</SelectItem>
                {categories.filter(cat => cat.id !== 'all').map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()} className="text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Render content based on contentType */}
          {contentType === 'raffles' && (
            <div className="space-y-4">
              {channelsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC929]"></div>
                </div>
              ) : channels.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Henüz ödül havuzu topluluğu bulunmuyor</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">İlk topluluğu siz oluşturun!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {channels.map((channel: any) => (
                    <ChannelCard key={channel.id} channel={channel} />
                  ))}
                </div>
              )}
            </div>
          )}

          {contentType === 'donations' && (
            <div className="space-y-4">
              {donationsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC929]"></div>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Henüz bağış kampanyası bulunmuyor</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">İlk kampanyayı siz başlatın!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {donations.map((donation: any) => (
                    <DonationCard key={donation.id} donation={donation} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>
          )}

          {contentType === 'corporate-funds' && (
            <div className="space-y-4">
              {corporateFundsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC929]"></div>
                </div>
              ) : corporateFunds.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Henüz kurumsal fon bulunmuyor</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">İlk kurumsal fonu siz oluşturun!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {corporateFunds.map((fund: any) => (
                    <CorporateFundCard key={fund.id} fund={fund} viewMode="card" />
                  ))}
                </div>
              )}
            </div>
          )}

            {/* Channel Creation Dialog */}
            <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
              <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <DialogHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-black" />
                    </div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent">
                      Yeni Kanal Oluştur
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Topluluk için yeni bir kanal oluşturun ve üyelerle etkileşime geçin
                    </p>
                  </DialogHeader>
                  <Form {...channelForm}>
                    <form onSubmit={channelForm.handleSubmit(onSubmitChannel)} className="space-y-5">
                      <FormField
                        control={channelForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Kanal Adı
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Örn: Kripto Tartışmaları"
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={channelForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Edit className="w-4 h-4 mr-2" />
                              Açıklama
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Kanalınızın amacını ve kurallarını açıklayın..."
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFC929] focus:border-transparent min-h-[80px]" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={channelForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Trophy className="w-4 h-4 mr-2" />
                                Kategori
                              </FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent">
                                    <SelectValue placeholder="Kategori seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    {categories
                                      .filter(cat => cat.id !== 'all')
                                      .map((category: any) => (
                                        <SelectItem 
                                          key={category.id} 
                                          value={category.id.toString()}
                                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateChannel(false)}
                          className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          İptal
                        </Button>
                        <Button
                          type="submit"
                          disabled={createChannelMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold shadow-lg disabled:opacity-50"
                        >
                          {createChannelMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                              Oluşturuluyor...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Topluluk Oluştur
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

            {/* Edit Channel Dialog */}
            <Dialog open={showEditChannel} onOpenChange={setShowEditChannel}>
              <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white shadow-2xl">
                <DialogHeader className="pb-6">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFC929]/20 to-[#FFB800]/30 rounded-2xl mx-auto mb-6 shadow-lg">
                    <Edit className="h-10 w-10 text-[#FFC929]" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent text-center">
                    Kanalı Düzenle
                  </DialogTitle>
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-2">
                    Kanalınızın bilgilerini güncelleyebilirsiniz
                  </p>
                </DialogHeader>
                <Form {...editChannelForm}>
                  <form onSubmit={editChannelForm.handleSubmit(onSubmitEditChannel)} className="space-y-6">
                    <FormField
                      control={editChannelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <User className="w-4 h-4 mr-2 text-[#FFC929]" />
                            Kanal Adı
                          </FormLabel>
                          <FormControl>
                            <Input {...field} 
                              placeholder="Kanal adınızı girin..."
                              className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editChannelForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Edit className="w-4 h-4 mr-2 text-[#FFC929]" />
                            Açıklama
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} 
                              placeholder="Kanalınızın amacını ve kurallarını açıklayın..."
                              className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200 resize-none" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editChannelForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Trophy className="w-4 h-4 mr-2 text-[#FFC929]" />
                            Kategori
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800">
                                <SelectValue placeholder="Kategori seçin" className="text-gray-900 dark:text-white" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                {categories
                                  .filter(cat => cat.id !== 'all')
                                  .map((category: any) => (
                                    <SelectItem 
                                      key={category.id} 
                                      value={category.id.toString()}
                                      className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={editChannelMutation.isPending}
                        className="h-14 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold w-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        {editChannelMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                            Güncelleniyor...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Edit className="h-5 w-5 mr-2" />
                            Kanalı Güncelle
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Content based on selected type */}
            {contentType === 'raffles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aktif Ödül Havuzları</h2>
                  <Button 
                    onClick={() => setLocation('/raffles')}
                    className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Tümünü Gör
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rafflesLoading ? (
                    [...Array(6)].map((_, i) => (
                      <Card key={i} className="h-80 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl"></Card>
                    ))
                  ) : upcomingRaffles.length > 0 ? (
                    upcomingRaffles.slice(0, 8).map((raffle: any) => (
                      <RaffleCard 
                        key={raffle.id} 
                        raffle={raffle} 
                        isInterested={interestedRaffles.includes(raffle.id)}
                        onToggleInterest={handleToggleRaffleInterest}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-500" />
                      <p className="text-lg text-gray-700 dark:text-gray-300">Henüz aktif ödül havuzu topluluğu bulunmuyor</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Yakında yeni ödül havuzu toplulukları eklenecek</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contentType === 'donations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aktif Bağış Kampanyaları</h2>
                  <Button 
                    onClick={() => setLocation('/donations')}
                    className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Tümünü Gör
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donations.map((donation: any) => (
                    <DonationCard
                      key={donation.id}
                      donation={donation}
                      onClick={() => setLocation(`/donation/${donation.id}`)}
                    />
                  ))}
                </div>
                {donations.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg text-gray-700 dark:text-gray-300">Henüz aktif bağış kampanyası bulunmuyor</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yakında yeni bağış kampanyaları eklenecek</p>
                  </div>
                )}
              </div>
            )}

            {contentType === 'corporate-funds' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aktif Kurumsal Fonlar</h2>
                  <Button 
                    onClick={() => setLocation('/corporate-funds')}
                    className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Tümünü Gör
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {corporateFunds.map((fund: any) => (
                    <CorporateFundCard
                      key={fund.id}
                      fund={fund}
                      onClick={() => setLocation(`/corporate-funds/${fund.id}`)}
                    />
                  ))}
                </div>
                {corporateFunds.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg text-gray-700 dark:text-gray-300">Henüz aktif kurumsal fon bulunmuyor</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yakında yeni kurumsal fonlar eklenecek</p>
                  </div>
                )}
              </div>
            )}
        </div>


      </div>
      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-black" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent">Yeni Kanal Oluştur</DialogTitle>
          </DialogHeader>
          <Form {...channelForm}>
            <form onSubmit={channelForm.handleSubmit(onSubmitChannel)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={channelForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Kanal Adı
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Örn: Kripto Tartışmaları"
                          className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={channelForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Edit className="w-4 h-4 mr-2" />
                        Açıklama
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Kanalınızın amacını ve kurallarını açıklayın..."
                          className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFC929] focus:border-transparent min-h-[80px]" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={channelForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Kategori
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent">
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          {categories
                            .filter(cat => cat.id !== 'all')
                            .map((category: any) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()}
                                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={createChannelMutation.isPending}
                  className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold w-full"
                >
                  {createChannelMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Topluluk Oluştur
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}