import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit3, Crown, CheckCircle, XCircle, Trophy, Users as UsersIcon } from 'lucide-react';

interface RaffleData {
  id: number;
  title: string;
  description: string;
  prizeValue: string;
  ticketPrice: string;
  maxTickets: number;
  ticketsSold: number;
  endDate: string;
  isActive: boolean;
  winnerId: number | null;
  creatorId: number;
  creator: {
    username: string;
    walletAddress: string;
  };
  category: {
    name: string;
  };
  isManual: boolean;
  createdByAdmin: boolean;
}

interface Participant {
  userId: number;
  username: string;
  walletAddress: string;
  ticketCount: number;
  totalAmount: string;
}

export function RaffleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleData | null>(null);
  const [winnerSelectionDialog, setWinnerSelectionDialog] = useState(false);
  const [participantsDialog, setParticipantsDialog] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Raffles Query
  const { data: raffles, isLoading: rafflesLoading, error: rafflesError } = useQuery({
    queryKey: ['/api/admin/raffles'],
    queryFn: () => apiRequest('GET', '/api/admin/raffles'),
  });

  // Debug logging
  console.log('RaffleManagement - raffles data:', raffles);
  console.log('RaffleManagement - raffles type:', typeof raffles);
  console.log('RaffleManagement - raffles.data type:', typeof raffles?.data);
  console.log('RaffleManagement - raffles.data.data type:', typeof raffles?.data?.data);
  console.log('RaffleManagement - raffles.data.data length:', raffles?.data?.data?.length);
  console.log('RaffleManagement - error:', rafflesError);

  // Winner selection mutation
  const selectWinnerMutation = useMutation({
    mutationFn: async ({ raffleId, method }: { raffleId: number; method: string }) => {
      return apiRequest('POST', '/api/admin/raffles/select-winner', { raffleId, method });
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Kazanan başarıyla seçildi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/raffles'] });
      setWinnerSelectionDialog(false);
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Kazanan seçilirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  // Raffle action mutation
  const raffleActionMutation = useMutation({
    mutationFn: async ({ raffleId, action }: { raffleId: number; action: string }) => {
      return apiRequest('POST', '/api/admin/raffles/action', { raffleId, action });
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Çekiliş işlemi tamamlandı',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/raffles'] });
    },
  });

  const handleSelectWinner = (raffle: RaffleData) => {
    setSelectedRaffle(raffle);
    setWinnerSelectionDialog(true);
  };

  const confirmSelectWinner = (method: string) => {
    if (selectedRaffle) {
      selectWinnerMutation.mutate({ raffleId: selectedRaffle.id, method });
    }
  };

  const viewParticipants = async (raffle: RaffleData) => {
    try {
      const response = await apiRequest('GET', `/api/admin/raffles/${raffle.id}/participants`);
      setParticipants(response.data || []);
      setSelectedRaffle(raffle);
      setParticipantsDialog(true);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Katılımcılar yüklenemedi',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Raffles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Çekilişler ({Array.isArray(raffles?.data?.data) ? raffles.data.data.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rafflesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
            </div>
          ) : rafflesError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Veri yüklenirken hata oluştu</p>
              <p className="text-sm text-muted-foreground">{rafflesError?.message}</p>
            </div>
          ) : !raffles?.data?.data ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Veri bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Oluşturan</TableHead>
                  <TableHead>Ödül Değeri</TableHead>
                  <TableHead>Bilet Satışı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kazanan</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(raffles?.data?.data) ? raffles.data.data.map((raffle: RaffleData) => (
                  <TableRow key={raffle.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{raffle.title}</div>
                        <div className="text-sm text-muted-foreground">
                          #{raffle.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{raffle.creator.username}</div>
                        {raffle.createdByAdmin && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${raffle.prizeValue}</TableCell>
                    <TableCell>
                      <div>
                        <div>{raffle.ticketsSold}/{raffle.maxTickets}</div>
                        <Progress 
                          value={(raffle.ticketsSold / raffle.maxTickets) * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={raffle.isActive ? 'default' : 'secondary'}>
                        {raffle.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {raffle.winnerId ? (
                        <Badge variant="outline">Seçildi</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleSelectWinner(raffle)}
                          disabled={!raffle.isActive || raffle.ticketsSold === 0}
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Kazanan Seç
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewParticipants(raffle)}
                        >
                          <UsersIcon className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => raffleActionMutation.mutate({ 
                            raffleId: raffle.id, 
                            action: raffle.isActive ? 'deactivate' : 'activate' 
                          })}
                        >
                          {raffle.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Veri formatı hatalı: {typeof raffles?.data?.data}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Winner Selection Dialog */}
      <Dialog open={winnerSelectionDialog} onOpenChange={setWinnerSelectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kazanan Seç</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              <strong>{selectedRaffle?.title}</strong> çekilişi için kazanan seçin:
            </p>
            <div className="text-sm text-muted-foreground">
              Toplam {selectedRaffle?.ticketsSold} bilet satıldı
            </div>
            <div className="flex gap-2">
              <Button onClick={() => confirmSelectWinner('random')}>
                <Crown className="h-4 w-4 mr-2" />
                Rastgele Seç
              </Button>
              <Button variant="outline" onClick={() => setWinnerSelectionDialog(false)}>
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog open={participantsDialog} onOpenChange={setParticipantsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Çekiliş Katılımcıları - {selectedRaffle?.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Cüzdan</TableHead>
                  <TableHead>Bilet Sayısı</TableHead>
                  <TableHead>Toplam Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.userId}>
                    <TableCell>{participant.username}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {participant.walletAddress.slice(0, 6)}...{participant.walletAddress.slice(-4)}
                      </code>
                    </TableCell>
                    <TableCell>{participant.ticketCount}</TableCell>
                    <TableCell>${participant.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}