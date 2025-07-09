import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Calendar, Target, DollarSign, Heart } from 'lucide-react';

const createDonationSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().min(1, 'Açıklama gerekli'),
  goalAmount: z.string().min(1, 'Hedef miktar gerekli'),
  endDate: z.string().optional(),
  isUnlimited: z.boolean().default(false),
  image: z.any().optional(),
  countryRestriction: z.string().default('all'),
  allowedCountries: z.array(z.string()).default([]),
  excludedCountries: z.array(z.string()).default([]),
});

type CreateDonationForm = z.infer<typeof createDonationSchema>;

const countries = [
  { code: 'TR', name: 'Türkiye' },
  { code: 'US', name: 'Amerika Birleşik Devletleri' },
  { code: 'DE', name: 'Almanya' },
  { code: 'FR', name: 'Fransa' },
  { code: 'GB', name: 'İngiltere' },
  { code: 'IT', name: 'İtalya' },
  { code: 'ES', name: 'İspanya' },
  { code: 'NL', name: 'Hollanda' },
  { code: 'BE', name: 'Belçika' },
  { code: 'CH', name: 'İsviçre' },
  { code: 'AT', name: 'Avusturya' },
  { code: 'SE', name: 'İsveç' },
  { code: 'NO', name: 'Norveç' },
  { code: 'DK', name: 'Danimarka' },
  { code: 'FI', name: 'Finlandiya' },
  { code: 'CA', name: 'Kanada' },
  { code: 'AU', name: 'Avustralya' },
  { code: 'JP', name: 'Japonya' },
  { code: 'KR', name: 'Güney Kore' },
  { code: 'SG', name: 'Singapur' }
];

export default function AdminDonationCreate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<CreateDonationForm>({
    resolver: zodResolver(createDonationSchema),
    defaultValues: {
      title: '',
      description: '',
      goalAmount: '',
      endDate: '',
      isUnlimited: false,
      image: null,
      countryRestriction: 'all',
      allowedCountries: [],
      excludedCountries: [],
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: CreateDonationForm) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('goalAmount', data.goalAmount);
      formData.append('isUnlimited', data.isUnlimited.toString());
      formData.append('countryRestriction', data.countryRestriction);
      formData.append('allowedCountries', JSON.stringify(data.allowedCountries));
      formData.append('excludedCountries', JSON.stringify(data.excludedCountries));
      
      if (data.endDate) {
        formData.append('endDate', new Date(data.endDate).toISOString());
      }
      
      if (data.image) {
        formData.append('image', data.image);
      }

      return fetch('/api/donations/create-manual', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Manuel Bağış Kampanyası Oluşturuldu',
        description: 'Bağış kampanyası başarıyla oluşturuldu ve yayınlandı.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Bağış kampanyası oluşturulurken bir hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateDonationForm) => {
    createDonationMutation.mutate(data);
  };

  const isUnlimited = form.watch('isUnlimited');

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const formatCountryRestriction = (restriction: string, allowed: string[], excluded: string[]) => {
    if (restriction === 'all') return 'Tüm ülkeler';
    if (restriction === 'selected') return `${allowed.length} ülke seçildi`;
    if (restriction === 'exclude') return `${excluded.length} ülke hariç`;
    return 'Tüm ülkeler';
  };

  const PreviewCard = () => {
    const formData = form.getValues();
    const currentAmount = 0; // Always 0 for new campaigns
    const progress = formData.goalAmount ? (currentAmount / parseFloat(formData.goalAmount)) * 100 : 0;
    
    return (
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt={formData.title || 'Kampanya görseli'} 
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-t-lg flex items-center justify-center">
              <Heart className="w-16 h-16 text-green-500" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-600 text-white font-bold">
              Bağış Kampanyası
            </Badge>
          </div>
          {formData.isUnlimited && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-blue-600 text-white">
                Süresiz
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
              {formData.title || 'Bağış Kampanyası Başlığı'}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {formData.description || 'Kampanya açıklaması buraya gelecek...'}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Toplanan</span>
                <span className="font-bold text-green-600">{currentAmount} USDT</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-green-500" />
                  <span>Hedef: {formData.goalAmount || '0'} USDT</span>
                </div>
                <span className="text-gray-500">
                  %{Math.round(progress)}
                </span>
              </div>
            </div>
            
            {!formData.isUnlimited && formData.endDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  Bitiş: {new Date(formData.endDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
            
            <div className="text-xs text-gray-400">
              <div>Ülke kısıtı: {formatCountryRestriction(
                formData.countryRestriction,
                formData.allowedCountries,
                formData.excludedCountries
              )}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-duxxan-yellow">
            Manuel Bağış Kampanyası Oluştur
          </CardTitle>
          <p className="text-muted-foreground">
            Platform kontrolünde manuel bağış kampanyası oluşturun
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kampanya Başlığı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Deprem Mağdurları İçin Yardım" {...field} />
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
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Bağış kampanyası hakkında detaylı bilgi..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hedef Miktar (USDT)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUnlimited"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Süresiz Bağış Kampanyası
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Kampanyanın bitiş tarihi olmayacak
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {!isUnlimited && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bitiş Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kampanya Görseli (İsteğe bağlı)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                          handleImageChange(file || null);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Bağış kampanyasının fotoğrafını yükleyin (JPG, PNG, WebP)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  🔒 Gizli Bağış Kampanyası
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Bu kampanya kullanıcılara tamamen gerçek görünecek. Bağışlar sahte olacak ancak 
                  gerçekçi görünecek. İstediğiniz zaman kontrol edebilirsiniz.
                </p>
              </div>

              <div className="flex gap-3">
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Önizleme
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Kampanya Önizlemesi</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <PreviewCard />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  type="submit" 
                  className="flex-1 bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90"
                  disabled={createDonationMutation.isPending}
                >
                  {createDonationMutation.isPending ? 'Oluşturuluyor...' : 'Bağış Kampanyası Oluştur'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}