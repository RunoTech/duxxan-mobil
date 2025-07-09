import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  Share2,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Send,
  Info,
  CheckCircle,
  AlertCircle,
  Settings,
  Edit,
  Star,
  TrendingUp,
  Clock,
  Target,
  Award,
  MessageCircle,
  Heart,
  Bookmark,
  MoreHorizontal,
  Plus,
  Eye,
  Activity,
  FileText,
  Tag,
  X,
  Sparkles,
  BarChart
} from 'lucide-react';

export default function CommunityDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingRaffle, setIsCreatingRaffle] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const [shareMenuPosition, setShareMenuPosition] = useState({ top: 0, right: 0 });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [raffleForm, setRaffleForm] = useState({
    title: '',
    description: '',
    prizeValue: '',
    prizeDescription: '',
    duration: '7',
    maxParticipants: '',
    requirements: ''
  });

  // Fetch channel details
  const { data: channelData, isLoading: channelLoading, error: channelError, refetch } = useQuery({
    queryKey: [`/api/channels/${id}`],
    enabled: !!id,
  });

  // Fetch channel raffles
  const { data: rafflesData, isLoading: rafflesLoading, refetch: refetchRaffles } = useQuery({
    queryKey: [`/api/channels/${id}/raffles`],
    enabled: !!id,
  });

  // Parse API response properly
  const channel = channelData?.data || channelData;
  const raffles = rafflesData?.data || rafflesData || [];
  
  // Debug logging
  console.log('CommunityDetail - Channel ID:', id);
  console.log('CommunityDetail - Raw channel data:', channelData);
  console.log('CommunityDetail - Parsed channel:', channel);
  console.log('CommunityDetail - Raffles data:', rafflesData);
  console.log('CommunityDetail - Parsed raffles:', raffles);
  console.log('CommunityDetail - Loading:', channelLoading);
  console.log('CommunityDetail - Error:', channelError);
  
  // Parse demo content if available
  const demoContent = channel?.demoContent ? JSON.parse(channel.demoContent) : null;
  const displayRaffles = channel?.isDemo && demoContent?.sampleRaffles ? demoContent.sampleRaffles : raffles;
  
  console.log('CommunityDetail - Display raffles:', displayRaffles);

  // Check if current user is the channel creator (simplified for demo)
  const isChannelCreator = true; // In real app, check against authenticated user ID

  // Initialize edit form when channel data loads
  if (channel && editForm.name === '') {
    setEditForm({
      name: channel.name || '',
      description: channel.description || '',
      category: channel.category || ''
    });
  }

  const handleJoin = () => {
    // Simulate wallet connection action
    toast({
      title: "Topluluğa Katılın",
      description: "Cüzdanınızı bağlayarak topluluğa katılabilirsiniz.",
    });
  };

  const handleShare = () => {
    if (shareButtonRef.current) {
      const rect = shareButtonRef.current.getBoundingClientRect();
      setShareMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setShowShareMenu(!showShareMenu);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Bağlantı Kopyalandı",
      description: "Topluluk bağlantısı panoya kopyalandı.",
    });
    setShowShareMenu(false);
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${channel?.name} topluluğuna katılın!`);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const handleEditChannel = async () => {
    try {
      const response = await apiRequest('PUT', `/api/channels/${id}`, editForm);
      if (response.ok) {
        toast({
          title: "Kanal güncellendi!",
          description: "Kanal bilgileri başarıyla güncellendi.",
        });
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kanal güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateRaffle = async () => {
    try {
      if (!channel) {
        toast({
          title: "Hata",
          description: "Kanal bilgisi bulunamadı",
          variant: "destructive",
        });
        return;
      }

      if (!raffleForm.title || !raffleForm.description || !raffleForm.prizeValue) {
        toast({
          title: "Eksik Bilgi",
          description: "Lütfen gerekli alanları doldurun.",
          variant: "destructive"
        });
        return;
      }

      // Create upcoming raffle data with channelId
      // Extract numeric value from prizeValue (remove currency symbols)
      const numericPrizeValue = raffleForm.prizeValue.replace(/[^\d.]/g, '') || '0';
      
      const raffleData = {
        title: raffleForm.title,
        description: raffleForm.description,
        prizeValue: numericPrizeValue, // Send only numeric value
        ticketPrice: '10', // Default ticket price
        maxTickets: parseInt(raffleForm.maxParticipants) || 100,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        categoryId: channel.categoryId,
        channelId: channel.id // Critical: Include channelId
      };

      console.log('Creating upcoming raffle with data:', raffleData);
      
      const response = await fetch('/api/upcoming-raffles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(raffleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upcoming raffle created:', result);
      
      toast({
        title: "Başarılı!",
        description: "Çekiliş duyurusu başarıyla oluşturuldu",
      });
      
      setIsCreatingRaffle(false);
      setRaffleForm({
        title: '',
        description: '',
        prizeValue: '',
        prizeDescription: '',
        duration: '7',
        maxParticipants: '',
        requirements: ''
      });
      
      // Refresh both channel data and raffles data
      refetch();
      refetchRaffles();
      
      // Give some time for the API to respond and refresh again
      setTimeout(() => {
        refetchRaffles();
      }, 1000);
    } catch (error) {
      console.error('Error creating raffle:', error);
      toast({
        title: "Hata",
        description: "Çekiliş oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (channelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Topluluk Bulunamadı</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Aradığınız topluluk mevcut değil.</p>
            <Button onClick={() => setLocation('/community')} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Topluluklara Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Hero Section with 3D Background */}
      <div className="relative h-96 bg-gradient-to-br from-[#FFC929] via-[#FFB800] to-[#FFA500] dark:from-[#FFC929] dark:via-[#FFB800] dark:to-[#FFA500] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFB800]/20 to-[#FFA500]/20 animate-pulse"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFC929]/40 via-[#FFC929]/10 to-transparent dark:from-black/60 dark:via-black/20 dark:to-transparent" />
        
        {/* Navigation */}
        <div className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/community')}
              variant="ghost"
              size="sm"
              className="text-black/80 hover:text-black hover:bg-black/10 backdrop-blur-sm rounded-lg px-3 py-2"
            >
              Topluluklar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-black/80 hover:text-black hover:bg-black/10 backdrop-blur-sm rounded-lg px-3 py-2"
            >
              Çekilişler
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {isChannelCreator && (
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black/80 hover:text-black hover:bg-black/10 backdrop-blur-sm rounded-lg px-3 py-2"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white shadow-2xl">
                  <DialogHeader className="pb-6">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFC929]/20 to-[#FFB800]/30 rounded-2xl mx-auto mb-6 shadow-lg">
                      <Settings className="h-10 w-10 text-[#FFC929]" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent text-center">
                      Kanalı Düzenle
                    </DialogTitle>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-2">
                      Kanalınızın bilgilerini güncelleyebilirsiniz
                    </p>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                        <Users className="w-4 h-4 mr-2 text-[#FFC929]" />
                        Kanal Adı
                      </Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                        placeholder="Kanal adını girin..."
                        className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2 text-[#FFC929]" />
                        Açıklama
                      </Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        placeholder="Kanalınızın amacını ve kurallarını açıklayın..."
                        rows={4}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200 resize-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                        <Tag className="w-4 h-4 mr-2 text-[#FFC929]" />
                        Kategori
                      </Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => handleEditFormChange('category', value)}
                      >
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800">
                          <SelectValue placeholder="Kategori seçin" className="text-gray-900 dark:text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                          <SelectItem value="kripto" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Kripto</SelectItem>
                          <SelectItem value="teknoloji" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Teknoloji</SelectItem>
                          <SelectItem value="finans" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Finans</SelectItem>
                          <SelectItem value="egitim" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Eğitim</SelectItem>
                          <SelectItem value="genel" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Genel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        onClick={handleEditChannel} 
                        className="flex-1 h-12 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Kaydet
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 h-12 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg transition-all duration-200"
                      >
                        <X className="h-5 w-5 mr-2" />
                        İptal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-[#FFC929]/20 shadow-xl rounded-2xl p-6 mb-4 -mt-72 relative z-10 overflow-visible">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <Avatar className="h-16 w-16 border-4 border-white/30 shadow-2xl">
                <AvatarImage src={channel?.avatar} alt={channel?.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] text-black text-lg font-bold">
                  {(channel?.name || 'C').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{channel?.name}</h1>
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>by {channel?.creator?.username || 'CryptoExpert'}</span>
                  <span>📍 Türkiye</span>
                  <span>📅 Kurulma: 15.03.2022</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed max-w-2xl mb-4">
                  {channel?.description || 'Türkiye\'nin en büyük kripto para topluluğu. Günlük analizler, çekiliş duyuruları ve eğitim içerikleri ile kripto dünyasında doğru bilgiye ulaşın.'}
                </p>
                
                {/* Tags */}
                <div className="flex gap-2">
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1 text-xs">BTC</Badge>
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1 text-xs">ETH</Badge>
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1 text-xs">Analiz</Badge>
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1 text-xs">DeFi</Badge>
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-1 text-xs">NFT</Badge>
                </div>
              </div>
            </div>
            
            {/* Subscribe Button and Member Count */}
            <div className="flex flex-col items-end gap-3">
              <Button
                className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black px-6 py-2 rounded-lg font-medium shadow-lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Abone Ol
              </Button>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">15.420</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Üye</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                $125.000
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Toplam Ödül</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                8
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Aktif Çekiliş</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                95%
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Topluluk Aktivitesi</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                98%
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Başarı Oranı</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 items-start">
          {/* Left Content - Raffles Section */}
          <div className="xl:col-span-3">
            {/* Raffles Section */}
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 bg-[#FFC929] dark:bg-[#FFC929] rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-black" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Kanalda Açılmış Çekilişler
                </h2>
              </div>

              {rafflesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin w-6 h-6 border-4 border-[#FFC929] border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Çekilişler yükleniyor...</p>
                  </div>
                </div>
              ) : displayRaffles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {/* Active Raffle 1 */}
                  <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate flex-1 mr-2">Harley Davidson</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="h-3 w-3 text-[#FFC929] fill-current" />
                          <span className="text-gray-900 dark:text-white text-xs font-medium">5.0</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 sm:mb-3 line-clamp-2">
                        2024 model Harley Davidson Sportster S. Sıfır kilometre motosiklet.
                      </p>
                      
                      <div className="mb-2 sm:mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Satılan Biletler</span>
                          <span className="text-gray-900 dark:text-white font-medium">89 / 1.200</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                          <div className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] h-1.5 rounded-full transition-all duration-300" style={{width: '7.4%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">7.4% satıldı</span>
                          <span className="text-[#FFC929] dark:text-[#FFC929] font-medium">Yeni başlıyor!</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">90</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Bilet Fiyatı</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">38</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Kalan Gün</div>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-bold py-2 text-xs sm:text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Bilet Al
                      </Button>
                      
                      <div className="flex justify-between items-center mt-2 sm:mt-3 text-xs">
                        <span className="text-gray-500 dark:text-gray-400 truncate">Ödül: <span className="text-gray-900 dark:text-white font-bold">420K</span></span>
                        <span className="text-gray-500 dark:text-gray-400 truncate">duxxan_admin</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Raffle 2 */}
                  <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate flex-1 mr-2">iPhone 15 Pro Max</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="h-3 w-3 text-[#FFC929] fill-current" />
                          <span className="text-gray-900 dark:text-white text-xs font-medium">4.8</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 sm:mb-3 line-clamp-2">
                        Yepyeni iPhone 15 Pro Max 256GB + AirPods Pro 2. Kutu açılmamış.
                      </p>
                      
                      <div className="mb-2 sm:mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Satılan Biletler</span>
                          <span className="text-gray-900 dark:text-white font-medium">2.450 / 5.000</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                          <div className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] h-1.5 rounded-full transition-all duration-300" style={{width: '49%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">49% satıldı</span>
                          <span className="text-[#FFC929] dark:text-[#FFC929] font-medium">Popüler!</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">25</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Bilet Fiyatı</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">12</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Kalan Gün</div>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-bold py-2 text-xs sm:text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Bilet Al
                      </Button>
                      
                      <div className="flex justify-between items-center mt-2 sm:mt-3 text-xs">
                        <span className="text-gray-500 dark:text-gray-400 truncate">Ödül: <span className="text-gray-900 dark:text-white font-bold">1.5K</span></span>
                        <span className="text-gray-500 dark:text-gray-400 truncate">duxxan_admin</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Raffle 3 */}
                  <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate flex-1 mr-2">PlayStation 5 Bundle</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="h-3 w-3 text-[#FFC929] fill-current" />
                          <span className="text-gray-900 dark:text-white text-xs font-medium">4.9</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 sm:mb-3 line-clamp-2">
                        PS5 konsol + 3 popüler oyun + ekstra DualSense kontrolcü paketi.
                      </p>
                      
                      <div className="mb-2 sm:mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Satılan Biletler</span>
                          <span className="text-gray-900 dark:text-white font-medium">3.200 / 4.000</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                          <div className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] h-1.5 rounded-full transition-all duration-300" style={{width: '80%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">80% satıldı</span>
                          <span className="text-orange-600 dark:text-orange-400 font-medium">Son şans!</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">15</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Bilet Fiyatı</div>
                        </div>
                        <div className="text-center">
                          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">5</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Kalan Gün</div>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-bold py-2 text-xs sm:text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Bilet Al
                      </Button>
                      
                      <div className="flex justify-between items-center mt-2 sm:mt-3 text-xs">
                        <span className="text-gray-500 dark:text-gray-400 truncate">Ödül: <span className="text-gray-900 dark:text-white font-bold">800</span></span>
                        <span className="text-gray-500 dark:text-gray-400 truncate">duxxan_admin</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Completed Raffle */}
                  <Card className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 shadow-xl rounded-2xl overflow-hidden opacity-75 transition-all duration-300 hover:opacity-90">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <h3 className="font-bold text-sm sm:text-base text-gray-700 dark:text-white truncate flex-1 mr-2">MacBook Air M2</h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <span className="text-green-600 dark:text-green-400 text-xs font-medium">Tamamlandı</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-500 dark:text-gray-300 text-xs mb-2 sm:mb-3 line-clamp-2">
                        Apple MacBook Air M2 çip, 256GB SSD, 8GB RAM. Sıfır kutusunda.
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-2 sm:mb-3">
                        <CheckCircle className="h-3 w-3" />
                        <span>Çekiliş Tamamlandı</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs mt-2 sm:mt-3">
                        <span className="text-gray-500 dark:text-gray-400 truncate">Ödül: <span className="text-gray-700 dark:text-white font-bold">1.2K</span></span>
                        <span className="text-gray-500 dark:text-gray-400 truncate">duxxan_admin</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Henüz Çekiliş Yok
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Bu toplulukta henüz aktif çekiliş bulunmuyor.
                      </p>
                      {isChannelCreator && (
                        <Button 
                          onClick={() => setIsCreatingRaffle(true)}
                          className="mt-4 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Çekiliş Oluştur
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Add Raffle Button - Always visible for channel creators */}
            {isChannelCreator && (
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => setIsCreatingRaffle(true)}
                  className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Kanala Çekiliş Ekle
                </Button>
              </div>
            )}
          </div>
            </div>
          </div>

          {/* Right Sidebar - Statistics */}
          <div className="xl:col-span-1 space-y-4 lg:space-y-6 xl:mt-[57px] order-first xl:order-last">
            {/* Statistics Card */}
            <Card className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] dark:from-gray-800 dark:to-gray-900 text-black dark:text-white border-0 dark:border dark:border-[#FFC929]/20 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <TrendingUp className="h-4 w-4 text-black/70 dark:text-[#FFC929]" />
                  <h3 className="text-sm font-semibold text-black dark:text-white">Topluluk İstatistikleri</h3>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-black/70 dark:text-white/80">Toplam Çekiliş</span>
                    <span className="text-xs sm:text-sm font-bold text-black dark:text-white">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-black/70 dark:text-white/80">Toplam Kazanan</span>
                    <span className="text-xs sm:text-sm font-bold text-black dark:text-white">892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-black/70 dark:text-white/80">Ortalama Ödül</span>
                    <span className="text-xs sm:text-sm font-bold text-black dark:text-white">$450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-black/70 dark:text-white/80">Aktif Üye</span>
                    <span className="text-xs sm:text-sm font-bold text-black dark:text-white">1250</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities Card */}
            <Card className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] dark:from-gray-800 dark:to-gray-900 text-black dark:text-white border-0 dark:border dark:border-[#FFC929]/20 shadow-xl transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Activity className="h-4 w-4 text-black/70 dark:text-[#FFC929]" />
                  <h3 className="text-sm font-semibold text-black dark:text-white">Son Aktiviteler</h3>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#FFB800] dark:bg-[#FFC929] rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-black dark:text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-black dark:text-white font-medium line-clamp-2">Yeni çekiliş başladı: iPhone 15 Pro Max</p>
                      <p className="text-xs text-black/70 dark:text-white/80">2 saat önce</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#FFB800] dark:bg-[#FFC929] rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-black dark:text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-black dark:text-white font-medium">250 yeni üye katıldı</p>
                      <p className="text-xs text-black/70 dark:text-white/80">5 saat önce</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#FFB800] dark:bg-[#FFC929] rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-black dark:text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-black dark:text-white font-medium line-clamp-2">MacBook Air çekilişi tamamlandı</p>
                      <p className="text-xs text-black/70 dark:text-white/80">1 gün önce</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#FFB800] dark:bg-[#FFC929] rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-black dark:text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-black dark:text-white font-medium line-clamp-2">Haftalık analiz raporu yayınlandı</p>
                      <p className="text-xs text-black/70 dark:text-white/80">2 gün önce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Raffle Creation Modal */}
        <Dialog open={isCreatingRaffle} onOpenChange={setIsCreatingRaffle}>
          <DialogContent className="max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-[#FFC929]/40 dark:border-[#FFC929]/60 shadow-2xl backdrop-blur-sm mx-4 sm:mx-auto">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <DialogTitle className="text-2xl font-bold text-[#FFC929] dark:text-[#FFC929] flex items-center gap-2">
                <Award className="h-6 w-6" />
                Yeni Çekiliş Oluştur
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                Topluluğunuz için yeni bir çekiliş oluşturun ve üyelerinizi heyecanlandırın.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Preview Card */}
              <Card className="bg-gradient-to-br from-[#FFC929]/15 to-[#FFB800]/25 dark:from-[#FFC929]/20 dark:to-[#FFB800]/30 border border-[#FFC929]/40 dark:border-[#FFC929]/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#FFC929] dark:text-[#FFC929] flex items-center gap-2 font-bold">
                    <Target className="h-5 w-5" />
                    Çekiliş Önizlemesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Award className="h-8 w-8 text-black" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">
                                {raffleForm.title || 'Çekiliş Başlığı'}
                              </h3>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                                Yeni
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {raffleForm.description || 'Çekiliş açıklaması burada görünecek...'}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>{raffleForm.duration ? `${raffleForm.duration} gün` : '7 gün'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <DollarSign className="h-4 w-4" />
                                <span>{raffleForm.prizeValue || '100 USDT'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Users className="h-4 w-4" />
                                <span>
                                  {raffleForm.maxParticipants 
                                    ? `Max ${raffleForm.maxParticipants} kişi` 
                                    : 'Sınırsız katılım'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold shadow-lg"
                            >
                              Katıl
                            </Button>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-[#FFC929]" />
                              <span className="text-xs text-gray-500">Yeni</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold text-gray-900 dark:text-white">
                      Çekiliş Başlığı *
                    </Label>
                    <Input
                      id="title"
                      value={raffleForm.title}
                      onChange={(e) => setRaffleForm({...raffleForm, title: e.target.value})}
                      placeholder="Örn: 100 USDT Çekilişi"
                      className="mt-2 border-2 border-[#FFC929]/30 dark:border-[#FFC929]/40 focus:border-[#FFC929] dark:focus:border-[#FFC929] transition-all duration-200 shadow-sm focus:shadow-md"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prizeValue" className="text-base font-semibold text-gray-900 dark:text-white">
                      Ödül Değeri *
                    </Label>
                    <Input
                      id="prizeValue"
                      value={raffleForm.prizeValue}
                      onChange={(e) => setRaffleForm({...raffleForm, prizeValue: e.target.value})}
                      placeholder="Örn: 100 USDT"
                      className="mt-2 border-2 border-[#FFC929]/30 dark:border-[#FFC929]/40 focus:border-[#FFC929] dark:focus:border-[#FFC929] transition-all duration-200 shadow-sm focus:shadow-md"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-base font-semibold text-gray-900 dark:text-white">
                      Süre (Gün) *
                    </Label>
                    <Select value={raffleForm.duration} onValueChange={(value) => setRaffleForm({...raffleForm, duration: value})}>
                      <SelectTrigger className="mt-2 border-2 border-[#FFC929]/30 dark:border-[#FFC929]/40 focus:border-[#FFC929] dark:focus:border-[#FFC929] transition-all duration-200 shadow-sm focus:shadow-md hover:border-[#FFC929]/50 dark:hover:border-[#FFC929]/60">
                        <SelectValue placeholder="Süre seçin" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-2 border-[#FFC929]/40 dark:border-[#FFC929]/50 shadow-xl backdrop-blur-sm">
                        <SelectItem value="1" className="text-gray-900 dark:text-white hover:bg-[#FFC929]/10 dark:hover:bg-[#FFC929]/20 focus:bg-[#FFC929]/15 dark:focus:bg-[#FFC929]/25 cursor-pointer">1 Gün</SelectItem>
                        <SelectItem value="3" className="text-gray-900 dark:text-white hover:bg-[#FFC929]/10 dark:hover:bg-[#FFC929]/20 focus:bg-[#FFC929]/15 dark:focus:bg-[#FFC929]/25 cursor-pointer">3 Gün</SelectItem>
                        <SelectItem value="7" className="text-gray-900 dark:text-white hover:bg-[#FFC929]/10 dark:hover:bg-[#FFC929]/20 focus:bg-[#FFC929]/15 dark:focus:bg-[#FFC929]/25 cursor-pointer">7 Gün</SelectItem>
                        <SelectItem value="14" className="text-gray-900 dark:text-white hover:bg-[#FFC929]/10 dark:hover:bg-[#FFC929]/20 focus:bg-[#FFC929]/15 dark:focus:bg-[#FFC929]/25 cursor-pointer">14 Gün</SelectItem>
                        <SelectItem value="30" className="text-gray-900 dark:text-white hover:bg-[#FFC929]/10 dark:hover:bg-[#FFC929]/20 focus:bg-[#FFC929]/15 dark:focus:bg-[#FFC929]/25 cursor-pointer">30 Gün</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants" className="text-base font-semibold text-gray-900 dark:text-white">
                      Maksimum Katılımcı
                    </Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={raffleForm.maxParticipants}
                      onChange={(e) => setRaffleForm({...raffleForm, maxParticipants: e.target.value})}
                      placeholder="Boş bırakın (sınırsız)"
                      className="mt-2 border-2 border-[#FFC929]/30 dark:border-[#FFC929]/40 focus:border-[#FFC929] dark:focus:border-[#FFC929] transition-all duration-200 shadow-sm focus:shadow-md"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-base font-semibold text-gray-900 dark:text-white">
                      Açıklama *
                    </Label>
                    <Textarea
                      id="description"
                      value={raffleForm.description}
                      onChange={(e) => setRaffleForm({...raffleForm, description: e.target.value})}
                      placeholder="Çekiliş hakkında detaylı açıklama yazın..."
                      rows={4}
                      className="mt-2 border-2 border-[#FFC929]/30 dark:border-[#FFC929]/40 focus:border-[#FFC929] dark:focus:border-[#FFC929] resize-none transition-all duration-200 shadow-sm focus:shadow-md"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prizeDescription" className="text-base font-semibold text-gray-900 dark:text-white">
                      Ödül Açıklaması
                    </Label>
                    <Textarea
                      id="prizeDescription"
                      value={raffleForm.prizeDescription}
                      onChange={(e) => setRaffleForm({...raffleForm, prizeDescription: e.target.value})}
                      placeholder="Ödül hakkında ek bilgiler..."
                      rows={3}
                      className="mt-2 border-2 border-[#FFC929]/30 dark:border-[#FFC929]/40 focus:border-[#FFC929] dark:focus:border-[#FFC929] resize-none transition-all duration-200 shadow-sm focus:shadow-md"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-base font-semibold text-gray-900 dark:text-white">
                      Katılım Gereksinimleri
                    </Label>
                    <Textarea
                      id="requirements"
                      value={raffleForm.requirements}
                      onChange={(e) => setRaffleForm({...raffleForm, requirements: e.target.value})}
                      placeholder="Ödül havuzuna katılım için gereksinimler..."
                      rows={3}
                      className="mt-2 border-2 border-[#FFC929]/30 dark:border-[#FFC929]/40 focus:border-[#FFC929] dark:focus:border-[#FFC929] resize-none transition-all duration-200 shadow-sm focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setIsCreatingRaffle(false)}
                  variant="outline"
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  İptal
                </Button>
                <Button
                  onClick={handleCreateRaffle}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Çekiliş Oluştur
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Menu Portal */}
        {showShareMenu && createPortal(
          <div 
            className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl backdrop-blur-sm z-[9999]"
            style={{
              top: `${shareMenuPosition.top}px`,
              right: `${shareMenuPosition.right}px`
            }}
          >
            <div className="p-2">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                Bağlantıyı Kopyala
              </button>
              <button
                onClick={() => shareToSocial('twitter')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter'da Paylaş
              </button>
              <button
                onClick={() => shareToSocial('facebook')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook'ta Paylaş
              </button>
              <button
                onClick={() => shareToSocial('telegram')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                Telegram'da Paylaş
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}