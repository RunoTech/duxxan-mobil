import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { insertRaffleSchema } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { Upload, X, ImageIcon, AlertTriangle } from 'lucide-react';
import { CountrySelector } from '@/components/CountrySelector';
import { CONTRACT_FEES } from '@/lib/contractConstants';
import { USDTRequirement } from '@/components/USDTRequirement';

const createRaffleSchema = insertRaffleSchema.extend({
  endDate: z.string().min(1, 'End date is required'),
});

type CreateRaffleForm = z.infer<typeof createRaffleSchema>;

export default function CreateRaffle() {
  const [, navigate] = useLocation();
  const { isConnected, address, user = {}, getApiHeaders } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [showRestrictionDialog, setShowRestrictionDialog] = useState(false);
  const [hasExistingDonations, setHasExistingDonations] = useState(false);
  const [countryRestrictions, setCountryRestrictions] = useState<{
    restriction: "all" | "selected" | "exclude";
    allowedCountries?: string[];
    excludedCountries?: string[];
  }>({
    restriction: "all",
    allowedCountries: undefined,
    excludedCountries: undefined,
  });

  // Check if user has created any donations
  useQuery({
    queryKey: ['/api/donations', 'user-check'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/donations');
      const donations = await response.json();
      const userDonations = donations.filter((d: any) => d.creatorId === user?.id);
      setHasExistingDonations(userDonations.length > 0);
      return donations;
    },
    enabled: !!user?.id,
  });

  const form = useForm<CreateRaffleForm>({
    resolver: zodResolver(createRaffleSchema),
    defaultValues: (() => {
      // Load draft if exists
      const savedDraft = localStorage.getItem('raffle_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          // Restore country restrictions if exists
          if (draft.countryRestrictions) {
            setCountryRestrictions(draft.countryRestrictions);
          }
          return {
            title: draft.title || '',
            description: draft.description || '',
            prizeValue: draft.prizeValue || '',
            ticketPrice: draft.ticketPrice || '',
            maxTickets: draft.maxTickets || 100,
            categoryId: draft.categoryId || 1,
            endDate: draft.endDate || '',
          };
        } catch (e) {
          console.error('Failed to load draft:', e);
        }
      }
      return {
        title: '',
        description: '',
        prizeValue: '',
        ticketPrice: '',
        maxTickets: 100,
        categoryId: 1,
        endDate: '',
      };
    })(),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const createRaffleMutation = useMutation({
    mutationFn: async (data: CreateRaffleForm) => {
      // Step 1: Process blockchain payment first
      const paymentResult = await blockchainService.createRaffle(
        data.prizeValue.toString(),
        address!
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Step 2: Create raffle with transaction hash
      const raffleData = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        maxTickets: data.maxTickets,
        endDate: new Date(data.endDate),
        prizeValue: data.prizeValue.toString(),
        ticketPrice: data.ticketPrice.toString(),
        countryRestriction: countryRestrictions.restriction,
        allowedCountries: countryRestrictions.allowedCountries ? JSON.stringify(countryRestrictions.allowedCountries) : null,
        excludedCountries: countryRestrictions.excludedCountries ? JSON.stringify(countryRestrictions.excludedCountries) : null,
        transactionHash: paymentResult.transactionHash,
      };

      // Create raffle in database
      const response = await apiRequest('POST', '/api/raffles', raffleData);
      return response.json();
    },
    onSuccess: (raffle) => {
      toast({
        title: 'Çekiliş Oluşturuldu!',
        description: 'Çekilişiniz başarıyla oluşturuldu ve yayına alındı. 25 USDT ödeme onaylandı.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/raffles'] });
      navigate('/raffles');
    },
    onError: (error: any) => {
      console.error('CreateRaffle error:', error);
      
      let title = 'Oluşturma Başarısız';
      let description = 'Ödül havuzu oluşturulamadı';
      
      if (error.message) {
        if (error.message.includes('İşlem kullanıcı tarafından reddedildi')) {
          title = 'İşlem İptal Edildi';
          description = 'Blockchain işlemi kullanıcı tarafından iptal edildi';
        } else if (error.message.includes('insufficient funds')) {
          title = 'Yetersiz Bakiye';
          description = 'USDT veya BNB bakiyenizi kontrol edin. 25 USDT + gas ücreti gerekiyor.';
        } else if (error.message.includes('allowance') || error.message.includes('USDT onay')) {
          title = 'USDT Onay Hatası';
          description = 'USDT onayı başarısız. MetaMask\'ta işlemi onaylayın ve tekrar deneyin.';
        } else if (error.message.includes('network') || error.message.includes('BSC')) {
          title = 'Ağ Hatası';
          description = 'BSC ağında olduğunuzdan emin olun. Ağ ayarlarınızı kontrol edin.';
        } else {
          description = error.message;
        }
      } else {
        description = 'Ödül havuzu oluşturulamadı. Cüzdan bağlantınızı ve 25 USDT bakiyenizi kontrol edin.';
      }
      
      toast({
        title,
        description,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: CreateRaffleForm) => {
    console.log('CreateRaffle submit - wallet state:', { isConnected, address, user });
    
    if (!isConnected || !address) {
      console.log('Wallet not connected, showing warning');
      toast({
        title: 'Cüzdanınızı Bağlayın',
        description: 'Ödül havuzu oluşturmak için cüzdanınızı bağlamanız gerekiyor',
        variant: 'destructive',
      });
      return;
    }

    // Check if user has existing donations - show popup warning
    if (hasExistingDonations) {
      setShowRestrictionDialog(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await createRaffleMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateOptimalPrice = () => {
    const prizeValue = parseFloat(form.getValues('prizeValue') || '0');
    const maxTickets = form.getValues('maxTickets') || 100;
    
    if (prizeValue > 0 && maxTickets > 0) {
      // Platform takes 5% + Creator takes 5% = 10% total commission
      // Need 110% of prize value to cover prize + commission
      const suggestedPrice = (prizeValue * 1.1) / maxTickets;
      // Minimum 1 USDT per ticket
      const finalPrice = Math.max(1, suggestedPrice);
      form.setValue('ticketPrice', finalPrice.toFixed(6));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 10 - photos.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      setPhotos(prev => [...prev, ...filesToAdd]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark flex items-center justify-center">
        <Card className="bg-white dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
            <p className="text-gray-600 dark:text-duxxan-text-secondary mb-6">
              Ödül havuzu oluşturmak için lütfen cüzdanınızı bağlayın.
            </p>
            <Link href="/">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-duxxan-page py-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Yeni Ödül Havuzu Oluştur</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Heyecan verici bir ödül havuzu oluşturun ve diğerlerinin harika ödüller kazanmasını sağlayın. 
            <span className="text-yellow-600 dark:text-yellow-500 font-semibold"> Oluşturma ücreti: 25 USDT</span>
          </p>
        </div>

        {/* USDT Requirement Warning */}
        <USDTRequirement />

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Ödül Havuzu Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Komisyon Bilgilendirme Kartı */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Komisyon ve Ücret Bilgileri</h3>
                      <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <div className="flex justify-between">
                          <span>• Oluşturma Ücreti:</span>
                          <span className="font-medium">{CONTRACT_FEES.RAFFLE_CREATION_FEE} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Toplam Komisyon:</span>
                          <span className="font-medium">%{CONTRACT_FEES.RAFFLE_COMMISSION_RATE}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Platform Payı:</span>
                          <span className="font-medium">%{CONTRACT_FEES.PLATFORM_SHARE / 10}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Oluşturan Payı (Size):</span>
                          <span className="font-medium text-green-600 dark:text-green-400">%{CONTRACT_FEES.CREATOR_SHARE / 10}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Para Birimi:</span>
                          <span className="font-medium">USDT (BNB Smart Chain)</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 bg-blue-100 dark:bg-blue-800 p-2 rounded">
                        Pasif Gelir: Her bilet satışından %5 komisyon kazanırsınız!
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white">
                            <SelectValue placeholder="Bir kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                          {(Array.isArray(categories) ? categories : []).map((category: any) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id.toString()}
                              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ödül Havuzu Başlığı</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="örn., Ferrari 488 GTB - Efsane Spor Araba"
                          className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <FormLabel>Ürün Fotoğrafları (En fazla 10 adet)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-yellow-300"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 10 && (
                      <label className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Fotoğraf Ekle</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {photos.length}/10 fotoğraf yüklendi. JPG, PNG formatları desteklenir.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ödülünüzü detaylı olarak açıklayın. Özellikler, durum, değer ve özel özellikleri dahil edin..."
                          className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white min-h-[100px]"
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
                    name="prizeValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ödül Değeri (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="300000"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-calculate ticket price when prize value changes
                              setTimeout(calculateOptimalPrice, 100);
                            }}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxTickets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maksimum Bilet Sayısı</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2000"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value) || 0);
                              // Auto-calculate ticket price when max tickets changes
                              setTimeout(calculateOptimalPrice, 100);
                            }}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ticketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Bilet Fiyatı (USDT)
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={calculateOptimalPrice}
                            className="text-yellow-600 hover:text-yellow-500 h-auto p-0 text-sm"
                          >
                            Otomatik Hesapla
                          </Button>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="150.00"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bitiş Tarihi</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            min={new Date().toISOString().slice(0, 16)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Commission Calculator - Creator's 5% Share Only */}
                {form.watch('prizeValue') && form.watch('ticketPrice') && form.watch('maxTickets') && (
                  <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-600">
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-3 text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                        Tahmini Komisyon Geliriniz
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Bilet Geliri</div>
                            <div className="font-bold text-lg text-gray-900 dark:text-white">
                              ${(parseFloat(form.watch('ticketPrice') || '0') * (form.watch('maxTickets') || 0)).toLocaleString()} USDT
                            </div>
                          </div>
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
                            <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Sizin Payınız (%5)</div>
                            <div className="font-bold text-xl text-yellow-800 dark:text-yellow-200">
                              ${((parseFloat(form.watch('ticketPrice') || '0') * (form.watch('maxTickets') || 0)) * 0.05).toLocaleString()} USDT
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded p-2">
                          <strong>Not:</strong> Platform toplam %10 komisyon alır. Bunun %5'i size, %5'i platforma gider. 
                          Yukarıdaki hesaplama sadece sizin alacağınız %5'lik payı gösterir.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* International Country Filtering System */}
                <CountrySelector
                  value={countryRestrictions}
                  onChange={setCountryRestrictions}
                  label="Ülke Kısıtlamaları"
                  description="Bu çekiliş için katılım ülke kısıtlamaları belirleyin"
                />

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-300 dark:border-blue-600 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Önemli Notlar</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Çekiliş oluşturma ücreti 25 USDT gönderimde tahsil edilecektir</li>
                    <li>• Platform %10 komisyon alır (%5 size, %5 platforma)</li>
                    <li>• Yetersiz bilet satılırsa, katılımcı fonları iade edilir</li>
                    <li>• Kazanan ve yaratıcı 6 gün içinde işlemi onaylamalıdır</li>
                    <li>• Tüm işlemler BSC üzerinde akıllı kontratlarla güvence altındadır</li>
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Link href="/raffles">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white"
                    >
                      İptal
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      // Save as draft
                      const draftData = form.getValues();
                      localStorage.setItem('raffle_draft', JSON.stringify({
                        ...draftData,
                        countryRestrictions,
                        savedAt: new Date().toISOString()
                      }));
                      toast({
                        title: 'Taslak Kaydedildi',
                        description: 'Ödül havuzu taslak olarak kaydedildi. İstediğiniz zaman devam edebilirsiniz.',
                      });
                    }}
                  >
                    Taslak Kaydet
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isConnected}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500 font-semibold"
                  >
                    {isSubmitting ? 'Ödeme İşleniyor...' : 'Ödül Havuzu Oluştur (25 USDT)'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Restriction Warning Dialog */}
      <Dialog open={showRestrictionDialog} onOpenChange={setShowRestrictionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Çekiliş Oluşturulamaz
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Bağış kampanyası oluşturmuş hesaplar çekiliş yapamaz. Bu, platform güvenliği ve 
              kullanıcı koruması için gerekli bir kısıtlamadır.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Çözüm:</h4>
            <p className="text-sm text-gray-600">
              Çekiliş yapmak için yeni bir cüzdan adresi kullanmanız gerekir.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Link href="/donations">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Bağışlara Dön
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => setShowRestrictionDialog(false)}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
