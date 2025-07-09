import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useToast } from '@/hooks/use-toast';
import { WalletStatus } from '@/components/WalletStatus';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Wallet, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Star, 
  Trophy, 
  Target,
  Clock,
  DollarSign,
  Gift,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function Profile() {
  const { user, isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    profession: user?.profession || '',
    bio: user?.bio || '',
    website: user?.website || '',
    city: user?.city || '',
  });

  // Fetch user's raffle participations
  const { data: participationsData, isLoading: participationsLoading } = useQuery({
    queryKey: ['/api/users/me/participations'],
    enabled: isConnected && !!user?.id,
    staleTime: 60 * 1000,
  });

  const participations = Array.isArray(participationsData) ? participationsData : [];

  // Fetch user's created raffles
  const { data: createdRafflesResponse, isLoading: createdRafflesLoading } = useQuery({
    queryKey: ['/api/raffles', { creator: user?.id }],
    enabled: isConnected && !!user?.id,
    staleTime: 60 * 1000,
  });

  const createdRaffles = (createdRafflesResponse as any)?.data || [];

  // Profile photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await apiRequest('POST', '/api/users/me/photo', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  if (!isConnected || !user) {
    return (
      <div className="min-h-screen bg-duxxan-page flex items-center justify-center transition-colors duration-200">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-duxxan-yellow" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Profilinizi görüntülemek için lütfen cüzdanınızı bağlayın.
            </p>
            <WalletStatus />
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/users/me', data);
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Başarılı",
        description: "Profiliniz güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      name: user?.name || '',
      profession: user?.profession || '',
      bio: user?.bio || '',
      website: user?.website || '',
      city: user?.city || '',
    });
    setIsEditing(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Hata",
          description: "Dosya boyutu 5MB'dan küçük olmalıdır",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Hata",
          description: "Sadece resim dosyaları yüklenebilir",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      uploadPhotoMutation.mutate(file);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast({
        title: "Kopyalandı",
        description: "Cüzdan adresi panoya kopyalandı",
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />);
    }
    
    return stars;
  };

  const getProfileStats = () => {
    const activeParticipations = participations.filter((p: any) => p.raffle?.isActive);
    const pastParticipations = participations.filter((p: any) => !p.raffle?.isActive);
    const wonRaffles = participations.filter((p: any) => p.raffle?.winnerId === user.id);
    const totalSpent = participations.reduce((sum: number, p: any) => 
      sum + parseFloat(p.totalAmount || '0'), 0
    );

    return {
      activeParticipations: activeParticipations.length,
      pastParticipations: pastParticipations.length,
      wonRaffles: wonRaffles.length,
      createdRaffles: createdRaffles.length,
      totalSpent,
    };
  };

  const stats = getProfileStats();

  return (
    <div className="min-h-screen bg-duxxan-page py-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6">
          <WalletStatus />
        </div>

        {/* Hero Profile Section */}
        <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl p-6 mb-6 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRoNGMwIDIgMiA0IDQgNHY0YzAgMi0yIDQtNCA0aC00Yy0yIDAtNC0yLTQtNHYtNHptMC0zMGMwLTIgMi00IDQtNGg0YzAgMiAyIDQgNCA0djRjMCAyLTIgNC00IDRoLTRjLTIgMC00LTItNC00VjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Profile Photo Section */}
              <div className="relative group">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                    <AvatarImage 
                      src={user.profilePhoto || user.profileImage} 
                      alt={user.name || user.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold bg-white text-yellow-500">
                      {(user.name || user.username)?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Photo Upload Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                       onClick={() => fileInputRef.current?.click()}>
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Camera className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {/* Upload Hint */}
                <p className="text-white text-xs text-center mt-2 opacity-75">
                  Fotoğrafı değiştirmek için tıklayın
                </p>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-white">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-4">
                    {/* Name and Username */}
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                        {user.name || user.username}
                      </h1>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                          @{user.username}
                        </span>
                        {user.isVerified && (
                          <div className="bg-green-500 bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Doğrulanmış
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="space-y-2">
                      {user.profession && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 opacity-75" />
                          <span className="text-lg">{user.profession}</span>
                        </div>
                      )}
                      {user.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 opacity-75" />
                          <span className="text-lg">{user.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {renderStars(parseFloat(user.rating || '0'))}
                      </div>
                      <span className="text-lg opacity-90">
                        {user.rating} • {user.ratingCount || 0} değerlendirme
                      </span>
                    </div>
                  </div>
                  
                  {/* Edit Button */}
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-5 w-5 mr-2" />
                        İptal
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-5 w-5 mr-2" />
                        Profili Düzenle
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet and Bio Section */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wallet Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-yellow-500" />
                  Cüzdan Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Adres:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded-lg font-mono border">
                        {address?.slice(0, 8)}...{address?.slice(-6)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyAddress}
                        className="h-8 w-8 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                      >
                        {copiedAddress ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ağ:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">BSC Mainnet</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Üyelik:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Hakkında
                </h3>
                {user.bio ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Henüz bir açıklama eklenmemiş.
                  </p>
                )}
                {user.website && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Aktif Katılım</p>
                  <p className="text-3xl font-bold">{stats.activeParticipations}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <Target className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 text-blue-100 text-sm">
                Devam eden çekilişler
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Geçmiş Katılım</p>
                  <p className="text-3xl font-bold">{stats.pastParticipations}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 text-purple-100 text-sm">
                Tamamlanan çekilişler
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Kazanılan</p>
                  <p className="text-3xl font-bold">{stats.wonRaffles}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <Trophy className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 text-yellow-100 text-sm">
                Başarılı çekilişler
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Toplam Harcama</p>
                  <p className="text-3xl font-bold">${stats.totalSpent.toFixed(0)}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <DollarSign className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 text-green-100 text-sm">
                USDT cinsinden
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Edit Form */}
        {isEditing && (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Edit3 className="h-6 w-6" />
                Profili Düzenle
              </CardTitle>
              <p className="text-yellow-100">
                Sadece profil fotoğrafı ve temel bilgilerinizi güncelleyebilirsiniz
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Kullanıcı Adı
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Kullanıcı adınız"
                      className="h-12 text-lg border-2 focus:border-yellow-500 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Ad Soyad
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Adınız ve soyadınız"
                      className="h-12 text-lg border-2 focus:border-yellow-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Meslek
                    </label>
                    <Input
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      placeholder="Mesleğiniz"
                      className="h-12 text-lg border-2 focus:border-yellow-500 rounded-xl"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Şehir
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Yaşadığınız şehir"
                      className="h-12 text-lg border-2 focus:border-yellow-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Website (Opsiyonel)
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://website.com"
                  className="h-12 text-lg border-2 focus:border-yellow-500 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  Hakkında
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  rows={4}
                  className="text-lg border-2 focus:border-yellow-500 rounded-xl resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Not: İletişim bilgileri (telefon, e-posta vb.) paylaşılamaz.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="px-8 py-3 rounded-xl font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <X className="h-5 w-5 mr-2" />
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Activity Tabs */}
        <Tabs defaultValue="active" className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                <Target className="h-4 w-4 mr-2" />
                Aktif Çekilişler
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                <Clock className="h-4 w-4 mr-2" />
                Geçmiş Katılımlar
              </TabsTrigger>
              <TabsTrigger 
                value="created"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                <Gift className="h-4 w-4 mr-2" />
                Oluşturulanlar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  Aktif Ödül Havuzu Katılımları
                </CardTitle>
                <p className="text-blue-100">
                  Şu anda katıldığınız ve devam eden ödül havuzları
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {participationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participations
                      .filter((p: any) => p.raffle?.isActive)
                      .map((participation: any) => (
                        <div
                          key={participation.id}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {participation.raffle?.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4" />
                                  {participation.ticketCount} bilet
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  ${participation.totalAmount} USDT
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-500 hover:bg-green-600 text-white mb-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                  Aktif
                                </div>
                              </Badge>
                              <p className="text-xs text-gray-500">
                                Çekiliş devam ediyor
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {participations.filter((p: any) => p.raffle?.isActive).length === 0 && (
                      <div className="text-center py-16">
                        <Target className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Aktif katılım bulunmuyor
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Hemen yeni çekilişlere katılarak şansınızı deneyin!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Clock className="h-6 w-6" />
                  Geçmiş Çekiliş Katılımları
                </CardTitle>
                <p className="text-purple-100">
                  Tamamlanmış çekilişlerdeki performansınız
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {participations
                    .filter((p: any) => !p.raffle?.isActive)
                    .map((participation: any) => (
                      <div
                        key={participation.id}
                        className={`${
                          participation.raffle?.winnerId === user.id 
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700" 
                            : "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700"
                        } border rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {participation.raffle?.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                {participation.ticketCount} bilet
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${participation.totalAmount} USDT
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(participation.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {participation.raffle?.winnerId === user.id ? (
                              <div className="space-y-2">
                                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  Kazandınız!
                                </Badge>
                                <p className="text-xs text-yellow-600 font-medium">
                                  Tebrikler!
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                  Tamamlandı
                                </Badge>
                                <p className="text-xs text-gray-500">
                                  Çekiliş bitti
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {participations.filter((p: any) => !p.raffle?.isActive).length === 0 && (
                    <div className="text-center py-16">
                      <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Geçmiş katılım bulunmuyor
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Ödül havuzlarına katılarak geçmişinizi oluşturmaya başlayın!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="created">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Gift className="h-6 w-6" />
                  Oluşturduğunuz Ödül Havuzları
                </CardTitle>
                <p className="text-green-100">
                  Platform'da yarattığınız ödül havuzu deneyimleri
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {createdRafflesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {createdRaffles.map((raffle: any) => (
                      <div
                        key={raffle.id}
                        className={`${
                          raffle.isActive 
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700" 
                            : "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700"
                        } border rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {raffle.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Gift className="h-4 w-4" />
                                ${raffle.prizeValue} ödül
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {raffle.ticketsSold}/{raffle.maxTickets} bilet
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(raffle.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            
                            {/* Progress Bar for Active Raffles */}
                            {raffle.isActive && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Satış Durumu</span>
                                  <span>{Math.round((raffle.ticketsSold / raffle.maxTickets) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(raffle.ticketsSold / raffle.maxTickets) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right ml-4">
                            {raffle.isActive ? (
                              <div className="space-y-2">
                                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    Aktif
                                  </div>
                                </Badge>
                                <p className="text-xs text-green-600 font-medium">
                                  Devam ediyor
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                  Tamamlandı
                                </Badge>
                                {raffle.winnerId && (
                                  <p className="text-xs text-gray-500">
                                    Kazanan belirlendi
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {createdRaffles.length === 0 && (
                      <div className="text-center py-16">
                        <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Henüz ödül havuzu oluşturmadınız
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          İlk ödül havuzunuzu oluşturarak topluluğa katkıda bulunun!
                        </p>
                        <Button 
                          onClick={() => window.location.href = '/create-raffle'}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          İlk Ödül Havuzumu Oluştur
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}