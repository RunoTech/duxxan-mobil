import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';

interface MutualApprovalSystemProps {
  raffle: {
    id: number;
    title: string;
    winnerId?: number;
    creatorId: number;
    isApprovedByCreator: boolean;
    isApprovedByWinner: boolean;
    creator: {
      username: string;
      organizationType?: string;
      organizationVerified?: boolean;
    };
    winner?: {
      username: string;
    };
  };
  onApprovalUpdate?: (updatedRaffle: any) => void;
}

export function MutualApprovalSystem({ raffle, onApprovalUpdate }: MutualApprovalSystemProps) {
  const [isApproving, setIsApproving] = useState(false);
  const { toast } = useToast();
  const { user } = useWallet();

  // Don't show approval system if no winner is assigned
  if (!raffle.winnerId) {
    return null;
  }

  // Check if current user is creator or winner
  const isCreator = user?.id === raffle.creatorId;
  const isWinner = user?.id === raffle.winnerId;

  console.log('MutualApprovalSystem - User:', user?.id, 'Creator:', raffle.creatorId, 'Winner:', raffle.winnerId, 'isCreator:', isCreator, 'isWinner:', isWinner);

  // Show debug info for now
  if (!isCreator && !isWinner) {
    return (
      <Card className="bg-blue-50 dark:bg-duxxan-surface border-blue-200 dark:border-duxxan-border">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-duxxan-yellow">Karşılıklı Onay Sistemi - Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Current User ID:</strong> {user?.id}</p>
            <p><strong>Creator ID:</strong> {raffle.creatorId}</p>
            <p><strong>Winner ID:</strong> {raffle.winnerId}</p>
            <p><strong>Is Creator:</strong> {isCreator ? 'Yes' : 'No'}</p>
            <p><strong>Is Winner:</strong> {isWinner ? 'Yes' : 'No'}</p>
            <p className="text-blue-600 dark:text-blue-400 mt-3">
              Bu sistemi sadece çekiliş oluşturan veya kazanan kullanabilir.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreatorApproval = async () => {
    setIsApproving(true);
    try {
      const response = await apiRequest('POST', `/api/raffles/${raffle.id}/approve-winner`);
      const result = await response.json();
      
      toast({
        title: "Onay Verildi",
        description: "Organizasyon onayı başarıyla verildi.",
      });
      
      if (onApprovalUpdate) {
        onApprovalUpdate(result.raffle);
      }
    } catch (error) {
      toast({
        title: "Onay Hatası",
        description: "Organizasyon onayı verilemedi.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleWinnerApproval = async () => {
    setIsApproving(true);
    try {
      const response = await apiRequest('POST', `/api/raffles/${raffle.id}/approve-creator`);
      const result = await response.json();
      
      toast({
        title: "Onay Verildi",
        description: "Kazanan onayı başarıyla verildi.",
      });
      
      if (onApprovalUpdate) {
        onApprovalUpdate(result.raffle);
      }
    } catch (error) {
      toast({
        title: "Onay Hatası",
        description: "Kazanan onayı verilemedi.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const getApprovalStatus = () => {
    if (raffle.isApprovedByCreator && raffle.isApprovedByWinner) {
      return {
        status: 'completed',
        message: 'Çekiliş karşılıklı onay ile tamamlandı',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />
      };
    } else if (raffle.isApprovedByCreator || raffle.isApprovedByWinner) {
      return {
        status: 'partial',
        message: 'Bir tarafın onayı bekleniyor',
        icon: <Clock className="w-5 h-5 text-yellow-500" />
      };
    } else {
      return {
        status: 'pending',
        message: 'Her iki tarafın onayı bekleniyor',
        icon: <AlertCircle className="w-5 h-5 text-orange-500" />
      };
    }
  };

  const approvalStatus = getApprovalStatus();

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          {approvalStatus.icon}
          <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
            DUXXAN Karşılıklı Onay Sistemi
          </CardTitle>
        </div>
        <CardDescription className="text-yellow-700 dark:text-yellow-300">
          {approvalStatus.message}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Creator Approval */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Organizasyon Onayı
              </h4>
              {raffle.isApprovedByCreator ? (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Onaylandı
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-400 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400">
                  <Clock className="w-3 h-3 mr-1" />
                  Bekliyor
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Organizasyon:</strong> {raffle.creator.username}</p>
              <p><strong>Tür:</strong> {raffle.creator.organizationType === 'foundation' ? 'Vakıf' : 
                                       raffle.creator.organizationType === 'association' ? 'Dernek' : 'Bireysel'}</p>
            </div>
            
            {!raffle.isApprovedByCreator && isCreator && (
              <Button 
                onClick={handleCreatorApproval}
                disabled={isApproving}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                size="sm"
              >
                {isApproving ? 'Onaylanıyor...' : 'Organizasyon Olarak Onayla'}
              </Button>
            )}
            
            {!raffle.isApprovedByCreator && !isCreator && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                {isWinner ? "Organizasyon onayı bekleniyor" : "Sadece organizasyon onay verebilir"}
              </div>
            )}
          </div>

          {/* Winner Approval */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Kazanan Onayı
              </h4>
              {raffle.isApprovedByWinner ? (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Onaylandı
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-400 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400">
                  <Clock className="w-3 h-3 mr-1" />
                  Bekliyor
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Kazanan:</strong> {raffle.winner?.username || 'TechMaster2024'}</p>
              <p><strong>Statü:</strong> Çekiliş Kazananı</p>
            </div>
            
            {!raffle.isApprovedByWinner && isWinner && (
              <Button 
                onClick={handleWinnerApproval}
                disabled={isApproving}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                {isApproving ? 'Onaylanıyor...' : 'Kazanan Olarak Onayla'}
              </Button>
            )}
            
            {!raffle.isApprovedByWinner && !isWinner && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                {isCreator ? "Kazanan kullanıcının onayı bekleniyor" : "Sadece kazanan onay verebilir"}
              </div>
            )}
          </div>
        </div>

        {/* Completion Message */}
        {raffle.isApprovedByCreator && raffle.isApprovedByWinner && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">Çekiliş Tamamlandı!</p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Her iki taraf da onay verdi. Artık ödeme ve teslimat aşamasına geçilebilir.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Bilgi:</strong> DUXXAN platformunda çekilişler, hem kazanan hem de organizasyonun onayı ile tamamlanır. 
            Bu sistem, güvenli ve şeffaf işlem garantisi sağlar.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}