import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Shield, Globe, Settings, FileText, Plus, Edit, Trash2, Check, X, DollarSign } from 'lucide-react';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import CorporateFunds from './CorporateFunds';

// Admin wallet adresleri - sadece bu adresler admin paneline erişebilir
const ADMIN_WALLETS = [
  '0x1234567890123456789012345678901234567890', // Ana admin
  '0x3a6cdb7c124e52e22ba14bfbc03c8a983931b756', // Test admin
  '0x7d9a85c38a28c4d696b7ee3b78ecc350db38f2a0', // Current user
];

export default function Admin() {
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);

  // Admin erişim kontrolü
  const isAdmin = isConnected && address && ADMIN_WALLETS.includes(address);

  // Always call hooks before any conditional returns
  const { data: countryRestrictions = [] } = useQuery({
    queryKey: ['/api/admin/country-restrictions'],
    queryFn: () => apiRequest('/api/admin/country-restrictions'),
    enabled: isAdmin
  });

  const { data: draftRaffles = [] } = useQuery({
    queryKey: ['/api/admin/draft-raffles'],
    queryFn: () => apiRequest('/api/admin/draft-raffles'),
    enabled: isAdmin
  });

  const { data: adminSettings = [] } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: () => apiRequest('/api/admin/settings'),
    enabled: isAdmin
  });

  // Country restriction mutations
  const createCountryRestrictionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/country-restrictions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/country-restrictions'] });
      toast({ title: 'Başarılı', description: 'Ülke kısıtlaması eklendi' });
      setCountryDialogOpen(false);
    },
  });

  const updateCountryRestrictionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/country-restrictions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/country-restrictions'] });
      toast({ title: 'Başarılı', description: 'Ülke kısıtlaması güncellendi' });
      setCountryDialogOpen(false);
    },
  });

  // Mutations (cleaned duplicates)

  const approveRaffleMutation = useMutation({
    mutationFn: ({ id, approve }: { id: number; approve: boolean }) =>
      apiRequest(`/api/admin/raffles/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approve }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/draft-raffles'] });
      toast({ title: 'Başarılı', description: 'Ödül havuzu durumu güncellendi' });
    },
  });

  // Early returns after all hooks
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Admin Paneli</h2>
            <p className="text-gray-600 mb-6">Admin paneline erişim için cüzdanınızı bağlayın</p>
            <Button onClick={() => window.location.href = '/'}>Ana Sayfaya Dön</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <X className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">Erişim Reddedildi</h2>
            <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmuyor</p>
            <Button onClick={() => window.location.href = '/'}>Ana Sayfaya Dön</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Paneli
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Platform yönetimi ve kontrolü
          </p>
        </div>

        <Tabs defaultValue="countries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="countries" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Ülke Kısıtlamaları
            </TabsTrigger>
            <TabsTrigger value="raffles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Onay Bekleyen Havuzlar
            </TabsTrigger>
            <TabsTrigger value="corporate-funds" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Corporate Funds
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Platform Ayarları
            </TabsTrigger>
          </TabsList>

          {/* Ülke Kısıtlamaları */}
          <TabsContent value="countries">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ülke Kısıtlamaları</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ülke bazlı erişim kısıtlamalarını yönetin
                  </p>
                </div>
                <Dialog open={countryDialogOpen} onOpenChange={setCountryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedCountry(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ülke Ekle
                    </Button>
                  </DialogTrigger>
                  <CountryRestrictionDialog
                    country={selectedCountry}
                    onSave={(data) => {
                      if (selectedCountry) {
                        updateCountryRestrictionMutation.mutate({ id: selectedCountry.id, data });
                      } else {
                        createCountryRestrictionMutation.mutate(data);
                      }
                    }}
                  />
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ülke</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Ödül Havuzu</TableHead>
                      <TableHead>Bağış</TableHead>
                      <TableHead>Katılım</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countryRestrictions.map((country: any) => (
                      <TableRow key={country.id}>
                        <TableCell className="font-medium">{country.countryName}</TableCell>
                        <TableCell>{country.countryCode}</TableCell>
                        <TableCell>
                          <Badge variant={country.isBlocked ? 'destructive' : 'default'}>
                            {country.isBlocked ? 'Yasaklı' : 'Aktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {country.allowRaffles ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />
                          }
                        </TableCell>
                        <TableCell>
                          {country.allowDonations ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />
                          }
                        </TableCell>
                        <TableCell>
                          {country.allowParticipation ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCountry(country);
                              setCountryDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onay Bekleyen Ödül Havuzları */}
          <TabsContent value="raffles">
            <Card>
              <CardHeader>
                <CardTitle>Onay Bekleyen Ödül Havuzları</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kullanıcılar tarafından oluşturulan onay bekleyen havuzlar
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Oluşturan</TableHead>
                      <TableHead>Ödül Değeri</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftRaffles.map((raffle: any) => (
                      <TableRow key={raffle.id}>
                        <TableCell className="font-medium">{raffle.title}</TableCell>
                        <TableCell>{raffle.creator?.username}</TableCell>
                        <TableCell>{raffle.prizeValue} USDT</TableCell>
                        <TableCell>
                          <Badge variant={
                            raffle.approvalStatus === 'pending' ? 'secondary' :
                            raffle.approvalStatus === 'approved' ? 'default' : 'destructive'
                          }>
                            {raffle.approvalStatus === 'pending' ? 'Bekliyor' :
                             raffle.approvalStatus === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(raffle.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell className="space-x-2">
                          {raffle.approvalStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveRaffleMutation.mutate({ id: raffle.id, approve: true })}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Onayla
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => approveRaffleMutation.mutate({ id: raffle.id, approve: false })}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reddet
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corporate Funds */}
          <TabsContent value="corporate-funds">
            <CorporateFunds />
          </TabsContent>

          {/* Platform Ayarları */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Ayarları</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Genel platform konfigürasyonları
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Ödül Havuzu Tutarı (USDT)</Label>
                      <Input type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maksimum Ödül Havuzu Tutarı (USDT)</Label>
                      <Input type="number" defaultValue="1000000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Platform Komisyon Oranı (%)</Label>
                      <Input type="number" step="0.1" defaultValue="5.0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Oluşturan Komisyon Oranı (%)</Label>
                      <Input type="number" step="0.1" defaultValue="5.0" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-approval" />
                    <Label htmlFor="auto-approval">Ödül havuzlarını otomatik onayla</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="maintenance-mode" />
                    <Label htmlFor="maintenance-mode">Bakım modu</Label>
                  </div>
                  <Button>Ayarları Kaydet</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Country Restriction Dialog Component
function CountryRestrictionDialog({ 
  country, 
  onSave 
}: { 
  country: any; 
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    countryCode: country?.countryCode || '',
    countryName: country?.countryName || '',
    isBlocked: country?.isBlocked || false,
    allowRaffles: country?.allowRaffles !== false,
    allowDonations: country?.allowDonations !== false,
    allowParticipation: country?.allowParticipation !== false,
    restrictionReason: country?.restrictionReason || '',
  });

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {country ? 'Ülke Kısıtlamasını Düzenle' : 'Yeni Ülke Kısıtlaması'}
        </DialogTitle>
        <DialogDescription>
          Ülke bazlı erişim kısıtlamalarını yapılandırın
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ülke Kodu (ISO 3)</Label>
            <Input
              value={formData.countryCode}
              onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))}
              placeholder="TUR"
              maxLength={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Ülke Adı</Label>
            <Input
              value={formData.countryName}
              onChange={(e) => setFormData(prev => ({ ...prev, countryName: e.target.value }))}
              placeholder="Türkiye"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isBlocked}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlocked: checked }))}
            />
            <Label>Ülkeyi tamamen yasakla</Label>
          </div>
          
          {!formData.isBlocked && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.allowRaffles}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowRaffles: checked }))}
                />
                <Label>Ödül havuzu oluşturmasına izin ver</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.allowDonations}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowDonations: checked }))}
                />
                <Label>Bağış kampanyası oluşturmasına izin ver</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.allowParticipation}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowParticipation: checked }))}
                />
                <Label>Katılım yapmasına izin ver</Label>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>Kısıtlama Sebebi</Label>
          <Textarea
            value={formData.restrictionReason}
            onChange={(e) => setFormData(prev => ({ ...prev, restrictionReason: e.target.value }))}
            placeholder="Kısıtlama sebebini açıklayın..."
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => onSave(formData)}>
          {country ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}