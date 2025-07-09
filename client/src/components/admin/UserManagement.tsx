import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit3, Ban, CheckCircle, XCircle, Shield, Users } from 'lucide-react';

interface UserData {
  id: number;
  walletAddress: string;
  username: string;
  name: string;
  email: string;
  accountStatus: string;
  organizationType: string;
  isVerified: boolean;
  totalSpent: string;
  totalWon: string;
  createdAt: string;
  lastLogin: string;
}

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  // Users Query
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users', { search: searchQuery, status: filterStatus }],
    queryFn: () => apiRequest('GET', `/api/admin/users?search=${searchQuery}&status=${filterStatus}`),
  });

  // User action mutation
  const userActionMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: number; action: string; reason?: string }) => {
      return apiRequest('POST', '/api/admin/users/action', { userId, action, reason });
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı işlemi tamamlandı',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'İşlem gerçekleştirilemedi',
        variant: 'destructive',
      });
    },
  });

  const handleUserAction = (userId: number, action: string, reason?: string) => {
    userActionMutation.mutate({ userId, action, reason });
  };

  const viewUserDetails = async (user: UserData) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Kullanıcı Ara</Label>
              <Input
                id="search"
                placeholder="Cüzdan adresi, kullanıcı adı veya email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Durum Filtresi</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                  <SelectItem value="banned">Yasaklı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kullanıcılar ({(users?.data?.data || []).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Cüzdan</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Harcama</TableHead>
                  <TableHead>Kazanç</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users?.data?.data || []).map((user: UserData) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.accountStatus === 'active' ? 'default' : 'secondary'}>
                        {user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.organizationType}
                      </Badge>
                    </TableCell>
                    <TableCell>${user.totalSpent}</TableCell>
                    <TableCell>${user.totalWon}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewUserDetails(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUserAction(user.id, user.accountStatus === 'active' ? 'deactivate' : 'activate')}
                        >
                          {user.accountStatus === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUserAction(user.id, user.isVerified ? 'unverify' : 'verify')}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUserAction(user.id, user.accountStatus === 'banned' ? 'unban' : 'ban')}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kullanıcı Adı</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <Label>Ad Soyad</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Cüzdan Adresi</Label>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    {selectedUser.walletAddress}
                  </code>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.email || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <Label>Hesap Durumu</Label>
                  <Badge variant={selectedUser.accountStatus === 'active' ? 'default' : 'secondary'}>
                    {selectedUser.accountStatus}
                  </Badge>
                </div>
                <div>
                  <Label>Organizasyon Tipi</Label>
                  <Badge variant="outline">
                    {selectedUser.organizationType}
                  </Badge>
                </div>
                <div>
                  <Label>Toplam Harcama</Label>
                  <p className="font-medium">${selectedUser.totalSpent}</p>
                </div>
                <div>
                  <Label>Toplam Kazanç</Label>
                  <p className="font-medium">${selectedUser.totalWon}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}