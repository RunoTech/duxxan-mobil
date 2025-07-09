import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { Wallet } from 'lucide-react';

interface WalletData {
  id: number;
  walletAddress: string;
  username: string;
  name: string;
  walletStats: {
    totalSpent: string;
    totalTickets: number;
    totalDonated: string;
    currentBalance: string;
  };
}

export function WalletManagement() {
  // Wallets Query
  const { data: wallets, isLoading: walletsLoading, error: walletsError } = useQuery({
    queryKey: ['/api/admin/wallets'],
    queryFn: () => apiRequest('GET', '/api/admin/wallets'),
  });

  // Debug logging
  console.log('WalletManagement - wallets data:', wallets);
  console.log('WalletManagement - wallets.data.data:', wallets?.data?.data);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Cüzdanlar ({Array.isArray(wallets?.data?.data) ? wallets.data.data.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {walletsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
            </div>
          ) : walletsError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Veri yüklenirken hata oluştu</p>
              <p className="text-sm text-muted-foreground">{walletsError?.message}</p>
            </div>
          ) : !wallets?.data?.data ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Veri bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Cüzdan Adresi</TableHead>
                  <TableHead>Toplam Harcama</TableHead>
                  <TableHead>Toplam Bilet</TableHead>
                  <TableHead>Toplam Bağış</TableHead>
                  <TableHead>Mevcut Bakiye</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(wallets?.data?.data) ? wallets.data.data.map((wallet: WalletData) => (
                  <TableRow key={wallet.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{wallet.username}</div>
                        <div className="text-sm text-muted-foreground">{wallet.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {wallet.walletAddress.slice(0, 6)}...{wallet.walletAddress.slice(-4)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        ${wallet.walletStats.totalSpent}
                      </Badge>
                    </TableCell>
                    <TableCell>{wallet.walletStats.totalTickets}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        ${wallet.walletStats.totalDonated}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {wallet.walletStats.currentBalance}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Veri formatı hatalı: {typeof wallets?.data?.data}
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