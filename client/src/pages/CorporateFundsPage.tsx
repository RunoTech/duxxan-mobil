import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCorporateFundSchema, type CorporateFund } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Plus, DollarSign, Target, CheckCircle, XCircle, Eye, Clock, Building2, TrendingUp, Users, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletFixed as useWallet } from "@/hooks/useWalletFixed";
import { z } from "zod";

type CreateFundForm = z.infer<typeof insertCorporateFundSchema>;

export default function CorporateFundsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address, isConnected } = useWallet();

  // Form setup
  const form = useForm<CreateFundForm>({
    resolver: zodResolver(insertCorporateFundSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: "",
      category: "education",
      organizationType: "corporation",
      status: "pending"
    }
  });

  // Fetch corporate funds
  const { data: corporateFunds = [], isLoading } = useQuery({
    queryKey: ["/api/corporate-funds"],
    queryFn: () => apiRequest("/api/corporate-funds")
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/corporate-funds/statistics"],
    queryFn: () => apiRequest("/api/corporate-funds/statistics")
  });

  // Create fund mutation
  const createFundMutation = useMutation({
    mutationFn: (data: CreateFundForm) =>
      apiRequest("/api/corporate-funds", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/corporate-funds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/corporate-funds/statistics"] });
      toast({ title: "Başarılı", description: "Kurumsal fon başvurunuz alındı ve inceleme aşamasındadır" });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Fon oluşturulurken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CreateFundForm) => {
    if (!isConnected) {
      toast({
        title: "Cüzdan Bağlayın",
        description: "Fon oluşturmak için cüzdanınızı bağlamanız gerekiyor",
        variant: "destructive"
      });
      return;
    }
    createFundMutation.mutate(data);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-3xl font-bold mb-4">Kurumsal Fonlar</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Şirketler ve kurumsal yapılar için özel fon oluşturma ve yönetim platformu
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Cüzdan Bağlayın
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Kurumsal Fonlar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Şirketler ve kurumsal yapılar için özel fon oluşturma ve yönetim platformu
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Fon</p>
                    <p className="text-2xl font-bold">{stats.totalFunds || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Fonlar</p>
                    <p className="text-2xl font-bold">{stats.activeFunds || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Tutar</p>
                    <p className="text-2xl font-bold">${stats.totalAmount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Katılımcılar</p>
                    <p className="text-2xl font-bold">{stats.totalParticipants || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Fund Button */}
        <div className="mb-6">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-duxxan-primary hover:bg-duxxan-primary/90">
                <Plus className="h-5 w-5 mr-2" />
                Yeni Kurumsal Fon Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">Kurumsal Fon Detayları</DialogTitle>
              </DialogHeader>
              
              {/* Ücret ve Komisyon Bilgilendirme Kartı */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Ücret ve Komisyon Bilgileri</h3>
                    <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <div className="flex justify-between">
                        <span>• Oluşturma Ücreti:</span>
                        <span className="font-medium">25 USDT (tek seferlik)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Platform Komisyonu:</span>
                        <span className="font-medium">%2 (her katkıdan)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Para Birimi:</span>
                        <span className="font-medium">USDT (BNB Smart Chain)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Minimum Hedef:</span>
                        <span className="font-medium">1,000 USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Güvenlik:</span>
                        <span className="font-medium">Smart Contract Koruması</span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 p-2 rounded">
                        💰 Katkılar anlık cüzdanınıza aktarılır! Komisyon katkı sahibinden otomatik kesilir.
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-800 p-2 rounded">
                        ⚠️ 25 USDT oluşturma ücreti iade edilmez ve cüzdanınızdan çekilecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b-2 border-blue-300 dark:border-blue-600 pb-3 text-blue-900 dark:text-blue-100">Temel Bilgiler</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Fon Adı *</FormLabel>
                            <FormControl>
                              <Input placeholder="Örn: Eğitim Desteği Fonu" {...field} />
                            </FormControl>
                            <FormDescription className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Açık ve anlaşılır bir fon adı seçin
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="targetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Hedef Tutar (USDT) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="100000" min="1000" {...field} />
                            </FormControl>
                            <FormDescription className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Minimum 1,000 USDT hedef tutar belirleyin
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Detaylı Açıklama *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Fonun amacı, kullanım alanları, beklenen sonuçlar ve organizasyon hakkında detayları..."
                              rows={6}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fonunuzun amacını, kullanım alanlarını ve beklenen etkiyi detaylı olarak açıklayın
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Category and Organization */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b-2 border-blue-300 dark:border-blue-600 pb-3 text-blue-900 dark:text-blue-100">Kategori ve Organizasyon</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Kategori *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Kategori seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="education">🎓 Eğitim</SelectItem>
                                <SelectItem value="healthcare">🏥 Sağlık</SelectItem>
                                <SelectItem value="environment">🌱 Çevre</SelectItem>
                                <SelectItem value="social">🤝 Sosyal Sorumluluk</SelectItem>
                                <SelectItem value="technology">💻 Teknoloji</SelectItem>
                                <SelectItem value="disaster">🚨 Afet Yardımı</SelectItem>
                                <SelectItem value="research">🔬 Araştırma & Geliştirme</SelectItem>
                                <SelectItem value="culture">🎭 Kültür & Sanat</SelectItem>
                                <SelectItem value="other">📋 Diğer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organizationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-gray-800 dark:text-gray-200">Organizasyon Türü *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Tür seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="corporation">🏢 Şirket</SelectItem>
                                <SelectItem value="foundation">🏛️ Vakıf</SelectItem>
                                <SelectItem value="association">👥 Dernek</SelectItem>
                                <SelectItem value="cooperative">🤝 Kooperatif</SelectItem>
                                <SelectItem value="government">🏛️ Kamu Kurumu</SelectItem>
                                <SelectItem value="international">🌍 Uluslararası Kuruluş</SelectItem>
                                <SelectItem value="university">🎓 Üniversite</SelectItem>
                                <SelectItem value="hospital">🏥 Hastane</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>



                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b-2 border-blue-300 dark:border-blue-600 pb-3 text-blue-900 dark:text-blue-100">Şartlar ve Koşullar</h3>
                    
                    <div className="rounded-lg border border-blue-200 dark:border-blue-700 p-4 bg-blue-50/50 dark:bg-blue-900/20">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Kurumsal fonlar, organizasyon adına oluşturulur ve organizasyon sorumluluğundadır.</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Tüm katkılardan %2 platform komisyonu otomatik olarak kesilir.</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Fon oluşturma için 25 USDT tek seferlik ücret alınır.</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Fonların kullanımı şeffaf şekilde raporlanmalıdır.</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">Platform, yasalara aykırı veya zararlı fonları reddetme hakkını saklı tutar.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-blue-200 dark:border-blue-700">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                      className="min-w-24"
                    >
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createFundMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white min-w-32"
                    >
                      {createFundMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Oluşturuluyor...
                        </>
                      ) : (
                        "Fon Oluştur (25 USDT)"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Corporate Funds List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-duxxan-primary mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Fonlar yükleniyor...</p>
            </div>
          ) : corporateFunds.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Henüz kurumsal fon bulunmuyor</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlk kurumsal fonu siz oluşturun ve topluma değer katın
              </p>
            </div>
          ) : (
            corporateFunds.map((fund: CorporateFund) => (
              <Card key={fund.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{fund.name}</CardTitle>
                    <Badge variant={
                      fund.status === 'active' ? 'default' : 
                      fund.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {fund.status === 'active' ? 'Aktif' : 
                       fund.status === 'pending' ? 'Onay Bekliyor' : 'Kapalı'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {fund.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Hedef Tutar:</span>
                      <span className="font-semibold">${Number(fund.targetAmount).toLocaleString()} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Toplanan:</span>
                      <span className="font-semibold text-green-600">
                        ${Number(fund.currentAmount || 0).toLocaleString()} USDT
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kategori:</span>
                      <span className="capitalize">{fund.category}</span>
                    </div>
                  </div>

                  {fund.status === 'active' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-duxxan-primary h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(
                            (Number(fund.currentAmount || 0) / Number(fund.targetAmount)) * 100, 
                            100
                          )}%` 
                        }}
                      ></div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {fund.organizationType && (
                        <span className="capitalize">{fund.organizationType}</span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.location.href = `/corporate-funds/${fund.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detaylar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}