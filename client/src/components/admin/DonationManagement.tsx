import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Heart, Eye, Edit3, CheckCircle, XCircle } from 'lucide-react';

interface DonationData {
  id: number;
  title: string;
  description: string;
  goalAmount: string;
  currentAmount: string;
  donorCount: number;
  endDate: string;
  isActive: boolean;
  creatorId: number;
  creator: {
    username: string;
    walletAddress: string;
  };
  category: string;
}

export function DonationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Donations Query
  const { data: donations, isLoading: donationsLoading, error: donationsError } = useQuery({
    queryKey: ['/api/admin/donations'],
    queryFn: () => apiRequest('GET', '/api/admin/donations'),
  });

  // Debug logging
  console.log('DonationManagement - donations data:', donations);
  console.log('DonationManagement - donations.data.data:', donations?.data?.data);

  // Donation action mutation
  const donationActionMutation = useMutation({
    mutationFn: async ({ donationId, action }: { donationId: number; action: string }) => {
      return apiRequest('POST', '/api/admin/donations/action', { donationId, action });
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Bağış işlemi tamamlandı',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/donations'] });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'İşlem gerçekleştirilemedi',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Bağışlar ({Array.isArray(donations?.data?.data) ? donations.data.data.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {donationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
            </div>
          ) : donationsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Veri yüklenirken hata oluştu</p>
              <p className="text-sm text-muted-foreground">{donationsError?.message}</p>
            </div>
          ) : !donations?.data?.data ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Veri bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Oluşturan</TableHead>
                  <TableHead>Hedef</TableHead>
                  <TableHead>İlerleme</TableHead>
                  <TableHead>Bağışçı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(donations?.data?.data) ? donations.data.data.map((donation: DonationData) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{donation.title}</div>
                        <div className="text-sm text-muted-foreground">
                          #{donation.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{donation.creator.username}</div>
                    </TableCell>
                    <TableCell>${donation.goalAmount}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">${donation.currentAmount} / ${donation.goalAmount}</div>
                        <Progress 
                          value={(parseFloat(donation.currentAmount) / parseFloat(donation.goalAmount)) * 100} 
                          className="w-24 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{donation.donorCount}</TableCell>
                    <TableCell>
                      <Badge variant={donation.isActive ? 'default' : 'secondary'}>
                        {donation.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => donationActionMutation.mutate({ 
                            donationId: donation.id, 
                            action: donation.isActive ? 'deactivate' : 'activate' 
                          })}
                        >
                          {donation.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Veri formatı hatalı: {typeof donations?.data?.data}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}