import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { insertDonationSchema } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react';
import { CountrySelector } from '@/components/CountrySelector';
import { CONTRACT_FEES } from '@/lib/contractConstants';
import { USDTRequirement } from '@/components/USDTRequirement';

const createDonationSchema = insertDonationSchema.extend({
  endDate: z.string().optional(),
  isUnlimited: z.boolean().default(false),
});

type CreateDonationForm = z.infer<typeof createDonationSchema>;

const DONATION_CATEGORIES = [
  { value: 'health', label: 'Sağlık' },
  { value: 'education', label: 'Eğitim' },
  { value: 'disaster', label: 'Afet Yardımı' },
  { value: 'environment', label: 'Çevre' },
  { value: 'animal', label: 'Hayvan Hakları' },
  { value: 'community', label: 'Toplum' },
  { value: 'technology', label: 'Teknoloji' },
  { value: 'general', label: 'Genel' },
];

const COUNTRIES = [
  { value: 'TUR', label: '🇹🇷 Türkiye' },
  { value: 'USA', label: '🇺🇸 Amerika' },
  { value: 'GER', label: '🇩🇪 Almanya' },
  { value: 'FRA', label: '🇫🇷 Fransa' },
  { value: 'GBR', label: '🇬🇧 İngiltere' },
  { value: 'JPN', label: '🇯🇵 Japonya' },
  { value: 'CHN', label: '🇨🇳 Çin' },
  { value: 'IND', label: '🇮🇳 Hindistan' },
];

export default function CreateDonation() {
  const [, navigate] = useLocation();
  const { isConnected, user = {}, getApiHeaders } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryRestrictions, setCountryRestrictions] = useState<{
    restriction: "all" | "selected" | "exclude";
    allowedCountries?: string[];
    excludedCountries?: string[];
  }>({
    restriction: "all",
    allowedCountries: undefined,
    excludedCountries: undefined,
  });

  // Get user data to determine organization type and permissions
  const { data: userData } = useQuery({
    queryKey: ['/api/users/me'],
    enabled: isConnected,
  });

  const form = useForm<CreateDonationForm>({
    resolver: zodResolver(createDonationSchema),
    defaultValues: {
      title: '',
      description: '',
      goalAmount: '',
      category: 'general',
      country: 'TUR',
      isUnlimited: false,
      endDate: '',
    },
  });

  const isUnlimited = form.watch('isUnlimited');
  const userDetails = user as any;
  const isOrganization = userDetails?.organizationType !== 'individual';
  const canCreateUnlimited = isOrganization && userDetails?.organizationVerified;

  // Calculate commission rate and startup fee based on contract
  const commissionRate = CONTRACT_FEES.DONATION_COMMISSION_RATE;
  const startupFee = CONTRACT_FEES.DONATION_CREATION_FEE;

  const createDonationMutation = useMutation({
    mutationFn: async (data: CreateDonationForm) => {
      if (!isConnected || !user) {
        throw new Error('Cüzdan bağlantısı gerekli');
      }

      // Validate unlimited donation permissions
      if (data.isUnlimited && !canCreateUnlimited) {
        throw new Error('Sınırsız bağış oluşturmak için doğrulanmış organizasyon hesabı gerekli');
      }

      // Validate end date for timed donations
      if (!data.isUnlimited && !data.endDate) {
        throw new Error('Süreli bağışlar için bitiş tarihi zorunludur');
      }

      const donationData = {
        title: data.title,
        description: data.description,
        goalAmount: data.goalAmount,
        category: data.category || 'general',
        country: data.country || 'TUR',
        isUnlimited: data.isUnlimited,
        endDate: data.endDate || null,
        countryRestriction: countryRestrictions.restriction,
        allowedCountries: countryRestrictions.allowedCountries ? JSON.stringify(countryRestrictions.allowedCountries) : null,
        excludedCountries: countryRestrictions.excludedCountries ? JSON.stringify(countryRestrictions.excludedCountries) : null,
      };

      // For unlimited donations with startup fee, handle payment first
      if (data.isUnlimited && startupFee > 0) {
        try {
          // Process startup fee payment through blockchain
          const startupFeeWei = (startupFee * 1e6).toString(); // Convert to USDT wei (6 decimals)
          const txHash = await blockchainService.transferUSDT(
            process.env.VITE_PLATFORM_WALLET || '0x0000000000000000000000000000000000000000',
            startupFeeWei
          );
          
          toast({
            title: "Başlangıç Ücreti Ödendi",
            description: `100 USDT başlangıç ücreti başarıyla ödendi. İşlem: ${txHash.slice(0, 10)}...`,
          });
        } catch (error) {
          throw new Error('Başlangıç ücreti ödemesi başarısız oldu');
        }
      }

      // Create donation via API
      const response = await apiRequest('POST', '/api/donations', donationData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bağış oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bağış Oluşturuldu",
        description: "Bağışınız başarıyla oluşturuldu!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      navigate('/donations');
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateDonationForm) => {
    if (!isConnected) {
      toast({
        title: "Cüzdan Bağlantısı Gerekli",
        description: "Bağış oluşturmak için cüzdanınızı bağlayın",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDonationMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-yellow-600">
                Cüzdan Bağlantısı Gerekli
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bağış oluşturmak için öncelikle cüzdanınızı bağlayın
              </p>
              <Link href="/">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2">
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1D2025] py-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Yeni Bağış Oluştur
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Toplumsal fayda için bağış kampanyası başlatın. 
              <span className="text-yellow-600 dark:text-yellow-500 font-semibold"> Oluşturma ücreti: {CONTRACT_FEES.DONATION_CREATION_FEE} USDT</span>
            </p>
          </div>

          {/* USDT Requirement Warning */}
          <USDTRequirement />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-yellow-600 dark:text-yellow-400">Bağış Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Ücret ve Komisyon Bilgilendirme Kartı */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Ücret ve Komisyon Bilgileri</h3>
                            <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                              <div className="flex justify-between">
                                <span>• Oluşturma Ücreti:</span>
                                <span className="font-medium">{CONTRACT_FEES.DONATION_CREATION_FEE} USDT (tek seferlik)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Platform Komisyonu:</span>
                                <span className="font-medium">%{CONTRACT_FEES.DONATION_COMMISSION_RATE} (her bağıştan)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Para Birimi:</span>
                                <span className="font-medium">USDT (BNB Smart Chain)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Minimum Bağış:</span>
                                <span className="font-medium">10 USDT</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Ödeme Sistemi:</span>
                                <span className="font-medium">Anlık cüzdan transferi</span>
                              </div>
                            </div>
                            <div className="mt-3 space-y-1">
                              <p className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800 p-2 rounded">
                                💰 Bağışlar anlık cüzdanınıza aktarılır! Komisyon bağışçıdan otomatik kesilir.
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800 p-2 rounded">
                                ⚠️ {CONTRACT_FEES.DONATION_CREATION_FEE} USDT oluşturma ücreti iade edilmez ve cüzdanınızdan çekilecektir.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-700 dark:text-yellow-400 font-medium">
                              Bağış Başlığı *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Bağışınız için açıklayıcı bir başlık"
                                className="bg-white dark:bg-gray-700 border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-700 dark:text-yellow-400 font-medium">
                              Açıklama *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Bağışınızın amacını ve detaylarını açıklayın..."
                                className="bg-white dark:bg-gray-700 border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="goalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-yellow-700 dark:text-yellow-400 font-medium">
                                Hedef Miktar (USDT) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.000001"
                                  min="1"
                                  placeholder="1000"
                                  className="bg-white dark:bg-gray-700 border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-yellow-700 dark:text-yellow-400 font-medium">
                                Kategori *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white dark:bg-gray-700 border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 dark:text-white">
                                    <SelectValue placeholder="Kategori seçin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white dark:bg-gray-800 border-yellow-400 dark:border-gray-600">
                                  {DONATION_CATEGORIES.map((category) => (
                                    <SelectItem key={category.value} value={category.value} className="text-gray-900 dark:text-white">
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-700 dark:text-yellow-400 font-medium">
                              Ülke
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-gray-700 border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 dark:text-white">
                                  <SelectValue placeholder="Ülke seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-gray-800 border-yellow-400 dark:border-gray-600">
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.value} value={country.value} className="text-gray-900 dark:text-white">
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Unlimited Donation Toggle */}
                      <FormField
                        control={form.control}
                        name="isUnlimited"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-yellow-400 dark:border-yellow-500 bg-white dark:bg-gray-800 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base text-yellow-700 dark:text-yellow-400 font-medium">
                                Sınırsız Bağış
                              </FormLabel>
                              <FormDescription>
                                {canCreateUnlimited 
                                  ? "Süresiz bağış kampanyası (Sadece doğrulanmış organizasyonlar)"
                                  : "Bu özellik sadece doğrulanmış organizasyonlar için mevcuttur"}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canCreateUnlimited}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* End Date - Only show for timed donations */}
                      {!isUnlimited && (
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-yellow-700 dark:text-yellow-400 font-medium">
                                Bitiş Tarihi *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  className="bg-white dark:bg-gray-700 border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 dark:text-white"
                                  min={new Date().toISOString().slice(0, 16)}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting || createDonationMutation.isPending}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 text-lg font-semibold border-2 border-yellow-500 hover:border-yellow-600"
                      >
                        {isSubmitting || createDonationMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Oluşturuluyor...
                          </div>
                        ) : (
                          'Bağış Oluştur'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              {/* Account Info */}
              <Card className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-600 dark:text-yellow-400">Hesap Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hesap Türü:</span>
                    <Badge variant={isOrganization ? "default" : "secondary"}>
                      {isOrganization ? "Organizasyon" : "Bireysel"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Doğrulama:</span>
                    <Badge variant={(userDetails as any)?.organizationVerified ? "default" : "destructive"}>
                      {(userDetails as any)?.organizationVerified ? "Doğrulanmış" : "Beklemede"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Komisyon Oranı:</span>
                    <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">%{commissionRate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* International Country Filtering System */}
              <CountrySelector
                value={countryRestrictions}
                onChange={setCountryRestrictions}
                label="Ülke Kısıtlamaları"
                description="Bu bağış kampanyası için katılım ülke kısıtlamaları belirleyin"
              />

              {/* Important Notice */}
              <Card className="bg-white dark:bg-gray-800 border-2 border-red-400 dark:border-red-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center">
                    <AlertTriangleIcon className="w-5 h-5 mr-2" />
                    Önemli Bilgi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="mb-2 font-semibold">
                      Bağış alan hesaplar çekiliş oluşturamaz
                    </p>
                    <p>
                      Bağış kampanyası oluşturduktan sonra sadece bağış kabul edebilirsiniz. 
                      Çekiliş yapmak için ayrı bir hesap kullanmanız gerekir.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Information */}
              <Card className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-600 dark:text-yellow-400 flex items-center">
                    <InfoIcon className="w-5 h-5 mr-2" />
                    Ücret Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-2">
                      <strong>Oluşturma Ücreti:</strong> {CONTRACT_FEES.DONATION_CREATION_FEE} USDT (iade edilmez)
                    </p>
                    <p className="mb-2">
                      <strong>Komisyon Oranı:</strong> %{CONTRACT_FEES.DONATION_COMMISSION_RATE} (platform'a gider)
                    </p>
                    <p>
                      <strong>Tüm Bağışlar:</strong> {CONTRACT_FEES.DONATION_CREATION_FEE} USDT başlangıç ücreti
                    </p>
                  </div>
                  
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-600 dark:text-yellow-400">Bağış Kuralları</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>• Tüm bağışlar USDT (BSC) ile gerçekleştirilir</p>
                  <p>• Bağış açıklamaları net ve şeffaf olmalıdır</p>
                  <p>• Yasadışı faaliyetler için bağış açılamaz</p>
                  <p>• Platform kurallarına uygun davranın</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}