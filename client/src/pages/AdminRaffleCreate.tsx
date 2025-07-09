import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Calendar, Users, DollarSign, Trophy } from 'lucide-react';

const createRaffleSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().min(1, 'Açıklama gerekli'),
  prizeValue: z.string().min(1, 'Ödül değeri gerekli'),
  ticketPrice: z.string().min(1, 'Bilet fiyatı gerekli'),
  maxTickets: z.string().min(1, 'Maksimum bilet sayısı gerekli'),
  categoryId: z.string().min(1, 'Kategori seçin'),
  endDate: z.string().min(1, 'Bitiş tarihi gerekli'),
  image: z.any().optional(),
  countryRestriction: z.string().default('all'),
  allowedCountries: z.array(z.string()).default([]),
  excludedCountries: z.array(z.string()).default([]),
});

type CreateRaffleForm = z.infer<typeof createRaffleSchema>;

const categories = [
  { id: 1, name: 'Elektronik' },
  { id: 2, name: 'Ev & Yaşam' },
  { id: 3, name: 'Moda & Aksesuar' },
  { id: 4, name: 'Spor & Outdoor' },
  { id: 5, name: 'Kitap & Hobi' },
  { id: 6, name: 'Diğer' }
];

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

export default function AdminRaffleCreate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<CreateRaffleForm>({
    resolver: zodResolver(createRaffleSchema),
    defaultValues: {
      title: '',
      description: '',
      prizeValue: '',
      ticketPrice: '',
      maxTickets: '',
      categoryId: '',
      endDate: '',
      image: null,
      countryRestriction: 'all',
      allowedCountries: [],
      excludedCountries: [],
    },
  });

  const createRaffleMutation = useMutation({
    mutationFn: async (data: CreateRaffleForm) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('prizeValue', data.prizeValue);
      formData.append('ticketPrice', data.ticketPrice);
      formData.append('maxTickets', data.maxTickets);
      formData.append('categoryId', data.categoryId);
      formData.append('endDate', new Date(data.endDate).toISOString());
      formData.append('isManual', 'true');
      formData.append('createdByAdmin', 'true');
      formData.append('countryRestriction', data.countryRestriction);
      formData.append('allowedCountries', JSON.stringify(data.allowedCountries));
      formData.append('excludedCountries', JSON.stringify(data.excludedCountries));
      
      if (data.image) {
        formData.append('image', data.image);
      }

      return fetch('/api/raffles/create-manual', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Manuel Çekiliş Oluşturuldu',
        description: 'Çekiliş başarıyla oluşturuldu ve yayınlandı.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/raffles'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Çekiliş oluşturulurken bir hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateRaffleForm) => {
    createRaffleMutation.mutate(data);
  };

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

  const getSelectedCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id.toString() === categoryId);
    return category?.name || 'Kategori';
  };

  const formatCountryRestriction = (restriction: string, allowed: string[], excluded: string[]) => {
    if (restriction === 'all') return 'Tüm ülkeler';
    if (restriction === 'selected') return `${allowed.length} ülke seçildi`;
    if (restriction === 'exclude') return `${excluded.length} ülke hariç`;
    return 'Tüm ülkeler';
  };

  const PreviewCard = () => {
    const formData = form.getValues();
    
    return (
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt={formData.title || 'Çekiliş görseli'} 
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-duxxan-yellow/20 to-orange-500/20 rounded-t-lg flex items-center justify-center">
              <Trophy className="w-16 h-16 text-duxxan-yellow" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className="bg-duxxan-yellow text-duxxan-dark font-bold">
              {getSelectedCategoryName(formData.categoryId)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
              {formData.title || 'Çekiliş Başlığı'}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {formData.description || 'Çekiliş açıklaması buraya gelecek...'}
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span className="font-medium">{formData.prizeValue || '0'} USDT</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" />
                <span>{formData.maxTickets || '0'} bilet</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                {formData.endDate 
                  ? new Date(formData.endDate).toLocaleDateString('tr-TR')
                  : 'Bitiş tarihi'
                }
              </span>
            </div>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Bilet Fiyatı:</span>
                <span className="font-bold text-duxxan-yellow">
                  {formData.ticketPrice || '0'} USDT
                </span>
              </div>
            </div>
            
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
            Manuel Çekiliş Oluştur
          </CardTitle>
          <p className="text-muted-foreground">
            Platform kontrolünde manuel çekiliş oluşturun
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
                    <FormLabel>Çekiliş Başlığı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: iPhone 15 Pro Max Çekilişi" {...field} />
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
                        placeholder="Çekiliş hakkında detaylı bilgi..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prizeValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ödül Değeri (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bilet Fiyatı (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxTickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maksimum Bilet</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
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

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çekiliş Görseli (İsteğe bağlı)</FormLabel>
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
                      Çekiliş ödülünün fotoğrafını yükleyin (JPG, PNG, WebP)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ülke Kısıtlamaları */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="countryRestriction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ülke Kısıtlaması</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Ülke kısıtlaması seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Tüm Ülkeler</SelectItem>
                          <SelectItem value="selected">Sadece Seçilen Ülkeler</SelectItem>
                          <SelectItem value="exclude">Seçilen Ülkeler Hariç</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('countryRestriction') === 'selected' && (
                  <FormField
                    control={form.control}
                    name="allowedCountries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İzin Verilen Ülkeler</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                          {countries.map((country) => (
                            <div key={country.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={country.code}
                                checked={field.value.includes(country.code)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, country.code]);
                                  } else {
                                    field.onChange(field.value.filter((c: string) => c !== country.code));
                                  }
                                }}
                              />
                              <label htmlFor={country.code} className="text-sm">
                                {country.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('countryRestriction') === 'exclude' && (
                  <FormField
                    control={form.control}
                    name="excludedCountries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hariç Tutulan Ülkeler</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                          {countries.map((country) => (
                            <div key={country.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={country.code}
                                checked={field.value.includes(country.code)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, country.code]);
                                  } else {
                                    field.onChange(field.value.filter((c: string) => c !== country.code));
                                  }
                                }}
                              />
                              <label htmlFor={country.code} className="text-sm">
                                {country.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  🔒 Gizli Çekiliş Oluştur
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Bu çekiliş kullanıcılara tamamen gerçek görünecek. Blockchain entegrasyonu olmaz, 
                  istediğiniz zaman kontrolü elinizde tutabilirsiniz. Platform yöneticisi kontrolünde.
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
                      <DialogTitle>Çekiliş Önizlemesi</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <PreviewCard />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  type="submit" 
                  className="flex-1 bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90"
                  disabled={createRaffleMutation.isPending}
                >
                  {createRaffleMutation.isPending ? 'Oluşturuluyor...' : 'Çekiliş Oluştur'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}