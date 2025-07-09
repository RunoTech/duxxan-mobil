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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCorporateFundSchema, insertFundAllocationSchema, type CorporateFund, type FundAllocation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Plus, DollarSign, Target, CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type CreateFundForm = z.infer<typeof insertCorporateFundSchema>;
type AllocateFundForm = z.infer<typeof insertFundAllocationSchema>;

export default function CorporateFunds() {
  const [selectedFund, setSelectedFund] = useState<CorporateFund | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch corporate funds
  const { data: funds, isLoading: fundsLoading } = useQuery({
    queryKey: ['/api/corporate-funds'],
    refetchOnWindowFocus: false,
  });

  // Fetch fund allocations for selected fund
  const { data: allocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['/api/fund-allocations', selectedFund?.id],
    enabled: !!selectedFund,
    refetchOnWindowFocus: false,
  });

  // Create fund form
  const createForm = useForm<CreateFundForm>({
    resolver: zodResolver(insertCorporateFundSchema),
    defaultValues: {
      name: "",
      description: "",
      fundType: "emergency",
      totalCapital: "",
      minimumAllocation: "1000",
      maximumAllocation: "50000",
      approvalRequired: true,
      boardMembers: "",
    },
  });

  // Allocate fund form
  const allocateForm = useForm<AllocateFundForm>({
    resolver: zodResolver(insertFundAllocationSchema),
    defaultValues: {
      fundId: selectedFund?.id || 0,
      donationId: 0,
      allocatedAmount: "",
      allocationReason: "",
    },
  });

  // Create fund mutation
  const createFundMutation = useMutation({
    mutationFn: (data: CreateFundForm) => apiRequest('/api/corporate-funds', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
    onSuccess: () => {
      toast({ title: "Kurumsal fon başarıyla oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ['/api/corporate-funds'] });
      setShowCreateDialog(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Hata", 
        description: error.message || "Fon oluşturulurken hata oluştu",
        variant: "destructive" 
      });
    },
  });

  // Allocate fund mutation
  const allocateFundMutation = useMutation({
    mutationFn: (data: AllocateFundForm) => apiRequest('/api/fund-allocations', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
    onSuccess: () => {
      toast({ title: "Fon tahsisi başarıyla oluşturuldu" });
      queryClient.invalidateQueries({ queryKey: ['/api/fund-allocations', selectedFund?.id] });
      setShowAllocateDialog(false);
      allocateForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Hata", 
        description: error.message || "Fon tahsisi yapılırken hata oluştu",
        variant: "destructive" 
      });
    },
  });

  const onCreateSubmit = (data: CreateFundForm) => {
    createFundMutation.mutate(data);
  };

  const onAllocateSubmit = (data: AllocateFundForm) => {
    allocateFundMutation.mutate({
      ...data,
      fundId: selectedFund?.id || 0,
    });
  };

  const getFundTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      emergency: "Acil Durum",
      education: "Eğitim",
      health: "Sağlık",
      infrastructure: "Altyapı",
      environmental: "Çevre",
      social: "Sosyal",
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "Beklemede", color: "bg-yellow-500" },
      approved: { label: "Onaylandı", color: "bg-green-500" },
      disbursed: { label: "Ödendi", color: "bg-blue-500" },
      rejected: { label: "Reddedildi", color: "bg-red-500" },
    };
    const { label, color } = config[status as keyof typeof config] || config.pending;
    return <Badge className={`text-white ${color}`}>{label}</Badge>;
  };

  if (fundsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              💰 Kurumsal Fonlar
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Bağış kampanyaları için kurumsal fon yönetimi
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Fon Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Kurumsal Fon</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fon Adı</FormLabel>
                        <FormControl>
                          <Input placeholder="Acil Durum Fonu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="fundType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fon Türü</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Fon türü seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="emergency">Acil Durum</SelectItem>
                            <SelectItem value="education">Eğitim</SelectItem>
                            <SelectItem value="health">Sağlık</SelectItem>
                            <SelectItem value="infrastructure">Altyapı</SelectItem>
                            <SelectItem value="environmental">Çevre</SelectItem>
                            <SelectItem value="social">Sosyal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="totalCapital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toplam Sermaye (USDT)</FormLabel>
                        <FormControl>
                          <Input placeholder="100000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Bu fon acil durum bağış kampanyaları için kullanılacaktır..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createFundMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {createFundMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Funds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funds?.map((fund: CorporateFund) => (
            <Card 
              key={fund.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedFund?.id === fund.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedFund(fund)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{fund.name}</CardTitle>
                  <Badge variant="outline">{getFundTypeLabel(fund.fundType)}</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {fund.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Toplam Sermaye:</span>
                    <span className="font-semibold">{parseFloat(fund.totalCapital).toLocaleString()} USDT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kullanılabilir:</span>
                    <span className="font-semibold text-green-600">
                      {parseFloat(fund.availableAmount).toLocaleString()} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tahsis Edildi:</span>
                    <span className="font-semibold text-orange-600">
                      {parseFloat(fund.allocatedAmount).toLocaleString()} USDT
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <Badge variant={fund.isActive ? "default" : "secondary"}>
                      {fund.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Fund Details */}
        {selectedFund && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {selectedFund.name} - Tahsis Detayları
                </CardTitle>
                <Dialog open={showAllocateDialog} onOpenChange={setShowAllocateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                      <Target className="w-4 h-4 mr-2" />
                      Fon Tahsis Et
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Fon Tahsisi</DialogTitle>
                    </DialogHeader>
                    <Form {...allocateForm}>
                      <form onSubmit={allocateForm.handleSubmit(onAllocateSubmit)} className="space-y-4">
                        <FormField
                          control={allocateForm.control}
                          name="donationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bağış Kampanyası ID</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="123" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={allocateForm.control}
                          name="allocatedAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tahsis Miktarı (USDT)</FormLabel>
                              <FormControl>
                                <Input placeholder="5000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={allocateForm.control}
                          name="allocationReason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tahsis Gerekçesi</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Bu kampanya acil durum kategorisinde olduğu için fondan destek sağlanması uygun görülmüştür..."
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setShowAllocateDialog(false)}>
                            İptal
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={allocateFundMutation.isPending}
                            className="bg-gradient-to-r from-green-600 to-blue-600"
                          >
                            {allocateFundMutation.isPending ? "Tahsis Ediliyor..." : "Tahsis Et"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {allocationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : allocations && allocations.length > 0 ? (
                <div className="space-y-4">
                  {allocations.map((allocation: FundAllocation) => (
                    <div key={allocation.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Kampanya ID: #{allocation.donationId}</p>
                          <p className="text-sm text-gray-600">
                            Tahsis: {parseFloat(allocation.allocatedAmount).toLocaleString()} USDT
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {allocation.allocationReason}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(allocation.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(allocation.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz tahsis yapılmamış</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}