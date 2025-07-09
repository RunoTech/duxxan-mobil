import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Shield,
  Star,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  AlertTriangle,
  Briefcase,
  Building,
  Gift,
  Trophy,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';


interface ProfileFormData {
  name?: string;
  email?: string;
  gender?: string;
  city?: string;
  profession?: string;
  bio?: string;
  organizationType?: string;
  organizationName?: string;
  country?: string;
}

interface DeviceInfo {
  id: number;
  deviceType: string;
  deviceName?: string;
  browser?: string;
  operatingSystem?: string;
  location?: string;
  lastLoginAt: string;
  createdAt: string;
}

interface UserPhoto {
  id: number;
  photoData: string;
  photoType: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt: string;
}

export default function ProfileNew() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Temporarily disable user data fetching to prevent excessive DB queries
  const user = null;
  const userLoading = false;

  // Show demo profile if no user data for testing
  const displayUser = user || {
    id: 1,
    username: 'demo_user',
    name: 'Demo Kullanıcı',
    email: 'demo@example.com',
    walletAddress: '0x1234567890123456789012345678901234567890',
    organizationType: 'individual' as const,
    country: 'Turkey',
    rating: '4.5',
    ratingCount: 12,
    profession: 'Geliştirici',
    city: 'İstanbul',
    bio: 'Blockchain teknolojileri ve kripto para alanında uzman geliştirici.',
    isVerified: false,
    organizationVerified: false,
    profileImage: undefined,
    gender: undefined,
    organizationName: undefined
  } as any;

  // Use demo data instead of API calls to prevent database overload
  const rawDevices = [];

  const devices = user ? (rawDevices as any[]) : [];

  // Use demo data to avoid unnecessary API calls
  const rawPhotos = [];

  const photos = user ? (rawPhotos as any[]) : [];

  const participatedRaffles = [];
  const wonRaffles = [];

  const displayParticipatedRaffles = user ? participatedRaffles : [];
  const displayWonRaffles = user ? wonRaffles : [];

  // Initialize form data when user data loads
  useEffect(() => {
    if (displayUser && !formData.name && !formData.email) {
      setFormData({
        name: displayUser.name || '',
        email: displayUser.email || '',
        gender: displayUser.gender || '',
        city: displayUser.city || '',
        profession: displayUser.profession || '',
        bio: displayUser.bio || '',
        organizationType: displayUser.organizationType || 'individual',
        organizationName: displayUser.organizationName || '',
        country: displayUser.country || '',
      });
    }
  }, [displayUser]);

  // Log device information on component mount
  useEffect(() => {
    const logDevice = async () => {
      if (!user) return; // Skip for demo mode
      
      try {
        const deviceInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          screenResolution: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: new Date().toISOString()
        };

        await apiRequest('POST', '/api/users/me/devices', deviceInfo);
      } catch (error) {
        console.error('Failed to log device info:', error);
      }
    };

    logDevice();
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user) {
        toast({
          title: "Demo Modu",
          description: "Demo modunda profil güncellenemez.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('PATCH', '/api/users/me', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      setIsEditing(false);
      toast({
        title: "Profil Güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Güncelleme Hatası",
        description: error.message || "Profil güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (photoData: string) => {
      if (!user) {
        toast({
          title: "Demo Modu",
          description: "Demo modunda fotoğraf yüklenemez.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('POST', '/api/users/me/photos', {
        photoData,
        photoType: 'profile'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/photos'] });
      toast({
        title: "Fotoğraf Yüklendi",
        description: "Profil fotoğrafınız başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Yükleme Hatası",
        description: error.message || "Fotoğraf yüklenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      if (!user) {
        toast({
          title: "Demo Modu",
          description: "Demo modunda fotoğraf silinemez.",
          variant: "destructive",
        });
        return;
      }
      
      await apiRequest('DELETE', `/api/users/me/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/photos'] });
      toast({
        title: "Fotoğraf Silindi",
        description: "Fotoğraf başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Silme Hatası",
        description: error.message || "Fotoğraf silinirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Approve raffle win mutation
  const approveRaffleMutation = useMutation({
    mutationFn: async (raffleId: number) => {
      if (!user) {
        toast({
          title: "Demo Modu",
          description: "Demo modunda çekiliş onaylanamaz.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('POST', `/api/raffles/${raffleId}/approve-win`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/raffles/won'] });
      toast({
        title: "Çekiliş Onaylandı",
        description: "Çekiliş kazancınız başarıyla onaylandı.",
      });
    },
    onError: (error) => {
      toast({
        title: "Onay Hatası",
        description: error.message || "Çekiliş onaylanırken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: displayUser?.name || '',
      email: displayUser?.email || '',
      gender: displayUser?.gender || '',
      city: displayUser?.city || '',
      profession: displayUser?.profession || '',
      bio: displayUser?.bio || '',
      organizationType: displayUser?.organizationType || 'individual',
      organizationName: displayUser?.organizationName || '',
      country: displayUser?.country || '',
    });
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/jpeg')) {
      toast({
        title: "Geçersiz Dosya Türü",
        description: "Sadece JPEG formatında resim yükleyebilirsiniz.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya Çok Büyük",
        description: "Maksimum 5MB boyutunda resim yükleyebilirsiniz.",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        uploadPhotoMutation.mutate(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Yükleme Hatası",
        description: "Dosya yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeRemaining = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return "Süre doldu";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat kaldı`;
    return `${hours} saat kaldı`;
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Modern Header Section */}
        <div className="relative mb-8">
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-4 right-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={updateProfileMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm"
                    >
                      {updateProfileMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      className="bg-gray-500 hover:bg-gray-600 text-white border-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <CardContent className="pt-0 pb-8">
              <div className="flex flex-col items-center text-center -mt-16">
                {/* Modern Profile Avatar */}
                <div className="relative mb-6">
                  <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-xl">
                    <AvatarImage 
                      src={displayUser?.profileImage} 
                      alt={displayUser?.name || displayUser?.username}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                      {(displayUser?.name || displayUser?.username)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* User Info */}
                <div className="w-full max-w-2xl">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {displayUser?.name || displayUser?.username}
                    </h1>
                    {displayUser?.isVerified && (
                      <Badge className="bg-blue-500 text-white border-0">
                        <Shield className="h-3 w-3 mr-1" />
                        Doğrulanmış
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    @{displayUser?.username}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3 mb-4">
                    {displayUser?.organizationType === 'foundation' && (
                      <Badge className="bg-emerald-500 text-white border-0">Vakıf</Badge>
                    )}
                    {displayUser?.organizationType === 'association' && (
                      <Badge className="bg-violet-500 text-white border-0">Dernek</Badge>
                    )}
                    {displayUser?.profession && (
                      <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
                        {displayUser?.profession}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span>{displayUser?.rating} ({displayUser?.ratingCount} değerlendirme)</span>
                    </div>
                    {displayUser?.country && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{displayUser?.country}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <User className="h-4 w-4 mr-2" />
              Profil Bilgileri
            </TabsTrigger>
            <TabsTrigger value="raffles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Gift className="h-4 w-4 mr-2" />
              Çekiliş Geçmişi
            </TabsTrigger>
            <TabsTrigger value="won" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Trophy className="h-4 w-4 mr-2" />
              Kazandığım Çekilişler
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-200">
              <Shield className="h-4 w-4 mr-2" />
              Güvenlik & Cihazlar
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Kişisel Bilgiler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ad Soyad"
                        className="border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.name || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="E-posta adresi"
                        className="border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.email || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Cinsiyet</Label>
                    {isEditing ? (
                      <Select value={formData.gender || ''} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="male">Erkek</SelectItem>
                          <SelectItem value="female">Kadın</SelectItem>
                          <SelectItem value="other">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.gender === 'male' ? 'Erkek' : 
                         displayUser?.gender === 'female' ? 'Kadın' : 
                         displayUser?.gender === 'other' ? 'Diğer' : 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Konum Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Ülke</Label>
                    {isEditing ? (
                      <Select value={formData.country || ''} onValueChange={(value) => setFormData({...formData, country: value})}>
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Ülke seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="TR">🇹🇷 Türkiye</SelectItem>
                          <SelectItem value="US">🇺🇸 Amerika Birleşik Devletleri</SelectItem>
                          <SelectItem value="DE">🇩🇪 Almanya</SelectItem>
                          <SelectItem value="FR">🇫🇷 Fransa</SelectItem>
                          <SelectItem value="GB">🇬🇧 Birleşik Krallık</SelectItem>
                          <SelectItem value="IT">🇮🇹 İtalya</SelectItem>
                          <SelectItem value="ES">🇪🇸 İspanya</SelectItem>
                          <SelectItem value="NL">🇳🇱 Hollanda</SelectItem>
                          <SelectItem value="CA">🇨🇦 Kanada</SelectItem>
                          <SelectItem value="AU">🇦🇺 Avustralya</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.country || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Şehir"
                        className="border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.city || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    Profesyonel Bilgiler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profession">Meslek</Label>
                    {isEditing ? (
                      <Input
                        id="profession"
                        value={formData.profession || ''}
                        onChange={(e) => setFormData({...formData, profession: e.target.value})}
                        placeholder="Mesleğiniz"
                        className="border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.profession || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biyografi</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Kendinizi tanıtın..."
                        rows={4}
                        className="border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.bio || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Building className="h-5 w-5 text-orange-600" />
                    Hesap Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Hesap Türü</Label>
                    {isEditing ? (
                      <Select value={formData.organizationType === 'foundation' || formData.organizationType === 'association' || formData.organizationType === 'company' ? 'corporate' : 'individual'} 
                              onValueChange={(value) => {
                                if (value === 'individual') {
                                  setFormData({...formData, organizationType: 'individual', organizationName: ''});
                                } else {
                                  setFormData({...formData, organizationType: 'foundation'});
                                }
                              }}>
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Hesap türü seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="individual">Bireysel</SelectItem>
                          <SelectItem value="corporate">Kurumsal</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {displayUser?.organizationType === 'individual' ? 'Bireysel' : 'Kurumsal'}
                        </p>
                        {displayUser?.accountStatus === 'pending_approval' && (
                          <Badge className="bg-yellow-500 text-white">Onay Bekliyor</Badge>
                        )}
                        {displayUser?.accountStatus === 'rejected' && (
                          <Badge className="bg-red-500 text-white">Reddedildi</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Onay durumu bilgilendirmesi */}
                  {displayUser?.accountStatus === 'pending_approval' && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                        <strong>Kurumsal hesap başvurunuz inceleniyor</strong>
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Başvurunuz 24-48 saat içinde değerlendirilecektir. Onay sürecinde hesabınızın bazı özellikleri kısıtlanabilir.
                      </p>
                      {displayUser?.approvalDeadline && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Son değerlendirme tarihi: {new Date(displayUser.approvalDeadline).toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {displayUser?.accountStatus === 'rejected' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                        <strong>Kurumsal hesap başvurunuz reddedildi</strong>
                      </p>
                      {displayUser?.rejectionReason && (
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Red nedeni: {displayUser.rejectionReason}
                        </p>
                      )}
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Eksik bilgileri tamamlayarak tekrar başvurabilirsiniz.
                      </p>
                    </div>
                  )}
                  
                  {/* Kurumsal hesap alt seçenekleri */}
                  {isEditing && (formData.organizationType === 'foundation' || formData.organizationType === 'association' || formData.organizationType === 'company') && (
                    <div className="space-y-2">
                      <Label htmlFor="organizationType">Kurum Türü</Label>
                      <Select value={formData.organizationType || 'foundation'} onValueChange={(value) => setFormData({...formData, organizationType: value})}>
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Kurum türü seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="foundation">Vakıf</SelectItem>
                          <SelectItem value="association">Dernek</SelectItem>
                          <SelectItem value="company">Resmi Kurum</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ⚠️ Kurumsal hesaba geçiş için 24-48 saat manuel onay süreci gereklidir.
                      </p>
                    </div>
                  )}
                  
                  {!isEditing && displayUser?.organizationType !== 'individual' && (
                    <div className="space-y-2">
                      <Label>Kurum Türü</Label>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.organizationType === 'foundation' ? 'Vakıf' :
                         displayUser?.organizationType === 'association' ? 'Dernek' :
                         displayUser?.organizationType === 'company' ? 'Resmi Kurum' : 'Belirtilmemiş'}
                      </p>
                    </div>
                  )}
                  
                  {/* Organizasyon adı sadece kurumsal hesaplarda göster */}
                  {(formData.organizationType === 'foundation' || formData.organizationType === 'association' || formData.organizationType === 'company' || 
                    (!isEditing && displayUser?.organizationType !== 'individual')) && (
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Kurum Adı</Label>
                      {isEditing ? (
                        <Input
                          id="organizationName"
                          value={formData.organizationName || ''}
                          onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                          placeholder="Kurum adı"
                          className="border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {displayUser?.organizationName || 'Belirtilmemiş'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Kaydet butonu */}
                  {isEditing && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                        >
                          {updateProfileMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Kaydet
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          İptal
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Raffle Participation History Tab */}
          <TabsContent value="raffles" className="space-y-8">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Gift className="h-5 w-5 text-purple-600" />
                  Katıldığım Ödül Havuzları
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayParticipatedRaffles.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Henüz ödül havuzuna katılmadınız
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      İlk ödül havuzuna katılın ve kazanma şansınızı yakalayın!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayParticipatedRaffles.map((participation: any) => (
                      <div
                        key={participation.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => window.open(`/raffles/${participation.raffle.id}`, '_blank')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {participation.raffle.title}
                              </h3>
                              <ExternalLink className="w-4 h-4 text-blue-500" />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span>{participation.quantity} bilet</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span>${participation.totalAmount} USDT</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Gift className="h-4 w-4 text-purple-500" />
                                <span>${participation.raffle.prizeValue} ödül</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>{new Date(participation.createdAt).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {participation.raffle.isActive ? (
                              <Badge className="bg-green-500 text-white">Aktif</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-400 text-gray-600">Sona Erdi</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Çekiliş bitiş tarihi: {new Date(participation.raffle.endDate).toLocaleDateString('tr-TR')}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Katılım: {formatDate(participation.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Won Raffles Tab */}
          <TabsContent value="won" className="space-y-8">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Kazandığım Çekilişler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayWonRaffles.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Henüz çekiliş kazanmadınız
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Çekilişlere katılmaya devam edin, kazanma şansınız her zaman var!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {displayWonRaffles.map((wonRaffle: any) => {
                      const isApprovalExpired = new Date() > new Date(wonRaffle.approvalDeadline);
                      const needsApproval = !wonRaffle.isApprovedByWinner && !isApprovalExpired;
                      
                      return (
                        <div
                          key={wonRaffle.id}
                          className={`border rounded-xl p-6 transition-all duration-300 ${
                            needsApproval 
                              ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700' 
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                  {wonRaffle.title}
                                </h3>
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-semibold">${wonRaffle.prizeValue} USDT Ödül</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span>Kazanıldı: {new Date(wonRaffle.winnerSelectedAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Approval Status */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Creator Approval */}
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className={`w-3 h-3 rounded-full ${
                                  wonRaffle.isApprovedByCreator ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Çekiliş Sahibi Onayı
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {wonRaffle.isApprovedByCreator ? 'Onaylandı' : 'Onay bekleniyor'}
                                  </p>
                                </div>
                              </div>

                              {/* Winner Approval */}
                              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className={`w-3 h-3 rounded-full ${
                                  wonRaffle.isApprovedByWinner ? 'bg-green-500' : 
                                  isApprovalExpired ? 'bg-red-500' : 'bg-yellow-500'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Kazanan Onayı (Sizin)
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {wonRaffle.isApprovedByWinner ? 'Onaylandı' : 
                                     isApprovalExpired ? 'Süre doldu' : 'Onay bekleniyor'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Approval Action */}
                            {needsApproval && (
                              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                                      Onay Gerekli - {formatTimeRemaining(wonRaffle.approvalDeadline)}
                                    </h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
                                      Bu çekilişi kazandınız! Ödülünüzü almak için 6 gün içinde onaylamanız gerekmektedir. 
                                      Son onay tarihi: {new Date(wonRaffle.approvalDeadline).toLocaleDateString('tr-TR')}
                                    </p>
                                    <Button
                                      onClick={() => approveRaffleMutation.mutate(wonRaffle.id)}
                                      disabled={approveRaffleMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      {approveRaffleMutation.isPending ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                      )}
                                      Çekilişi Onayla
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Approved Status */}
                            {wonRaffle.isApprovedByWinner && wonRaffle.isApprovedByCreator && (
                              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  <div>
                                    <h4 className="font-semibold text-green-800 dark:text-green-300">
                                      Çekiliş Tamamlandı
                                    </h4>
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                      Ödülünüz onaylandı ve hesabınıza aktarıldı.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Expired Status */}
                            {isApprovalExpired && !wonRaffle.isApprovedByWinner && (
                              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                  <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-300">
                                      Onay Süresi Doldu
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-400">
                                      Maalesef 6 günlük onay süreniz doldu. Ödül geri çekilişe alınmıştır.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Devices Tab */}
          <TabsContent value="security" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Wallet Information */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Cüzdan Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cüzdan Adresi</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg flex-1 break-all font-mono border border-gray-200 dark:border-gray-700">
                        {displayUser?.walletAddress}
                      </code>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4" />
                    <span>Cüzdan bağlantısı güvenli</span>
                  </div>
                </CardContent>
              </Card>

              {/* Login Devices */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    Giriş Yapılan Cihazlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {devices.map((device: any) => (
                    <div key={device.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-0">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {device.deviceName || device.deviceType}
                          </h4>
                          <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                            {device.deviceType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{device.browser}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            <span>{device.operatingSystem}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{device.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Son giriş: {formatDate(device.lastLoginAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {devices.length === 0 && (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Cihaz bilgisi bulunamadı
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}