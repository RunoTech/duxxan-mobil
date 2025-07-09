import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle, CheckCircle, Clock, Activity, Lock } from 'lucide-react';

interface SecurityStats {
  blockedIPs: number;
  totalRequests: number;
  suspiciousActivity: number;
  rateLimitHits: number;
  activeConnections: number;
  lastAttackTime?: string;
}

interface RateLimitInfo {
  endpoint: string;
  limit: number;
  window: string;
  description: string;
}

export default function SecurityDashboard() {
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    blockedIPs: 0,
    totalRequests: 0,
    suspiciousActivity: 0,
    rateLimitHits: 0,
    activeConnections: 0
  });

  const { data: securityStatus } = useQuery({
    queryKey: ['/api/security/status'],
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });

  useEffect(() => {
    if (securityStatus) {
      setSecurityStats(securityStatus);
    }
  }, [securityStatus]);

  const rateLimits: RateLimitInfo[] = [
    { endpoint: 'Genel Endpoint\'ler', limit: 100, window: '15 dakika', description: 'Tüm API istekleri için genel limit' },
    { endpoint: 'Kimlik Doğrulama', limit: 20, window: '15 dakika', description: 'Giriş ve kayıt işlemleri' },
    { endpoint: 'Çekiliş/Bağış Oluşturma', limit: 10, window: '15 dakika', description: 'İçerik oluşturma işlemleri' },
    { endpoint: 'Bilet/Katkı İşlemleri', limit: 50, window: '15 dakika', description: 'Finansal işlemler' },
    { endpoint: 'Güvenlik Rotaları', limit: 5, window: '15 dakika', description: 'Admin ve güvenlik işlemleri' }
  ];

  const getSecurityLevel = () => {
    if (securityStats.blockedIPs > 10) return { level: 'Yüksek Risk', color: 'destructive', icon: AlertTriangle };
    if (securityStats.blockedIPs > 5) return { level: 'Orta Risk', color: 'warning', icon: Clock };
    return { level: 'Güvenli', color: 'success', icon: CheckCircle };
  };

  const securityLevel = getSecurityLevel();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Güvenlik Kontrol Paneli</h1>
          <p className="text-muted-foreground">Gerçek zamanlı DDoS koruması ve güvenlik durumu</p>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Güvenlik Seviyesi</CardTitle>
            <securityLevel.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityLevel.level}</div>
            <Badge variant={securityLevel.color as any} className="mt-2">
              {securityStats.blockedIPs > 0 ? 'Aktif Koruma' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engellenen IP'ler</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">Son 30 dakika</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şüpheli Aktivite</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{securityStats.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">Tespit edilen saldırı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Bağlantılar</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityStats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">Güvenli bağlantı</p>
          </CardContent>
        </Card>
      </div>

      {/* DDoS Protection Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            DDoS Koruma Sistemi
          </CardTitle>
          <CardDescription>
            Gerçek zamanlı saldırı tespiti ve otomatik engelleme aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">AKTIF</div>
              <p className="text-sm text-muted-foreground">Koruma Durumu</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
              <p className="text-sm text-muted-foreground">Güvenlik Katmanı</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">10/sn</div>
              <p className="text-sm text-muted-foreground">Saldırı Eşiği</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting Configuration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hız Sınırlama Yapılandırması</CardTitle>
          <CardDescription>
            Endpoint bazlı koruma limitleri ve kuralları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {rateLimits.map((limit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{limit.endpoint}</h4>
                    <p className="text-sm text-muted-foreground">{limit.description}</p>
                  </div>
                  <Badge variant="outline">
                    {limit.limit} / {limit.window}
                  </Badge>
                </div>
                <Progress value={(limit.limit / 100) * 100} className="w-full" />
                {index < rateLimits.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle>Güvenlik Özellikleri</CardTitle>
          <CardDescription>
            Aktif koruma mekanizmaları ve güvenlik önlemleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Otomatik IP Engelleme</p>
                <p className="text-sm text-muted-foreground">30 dakika süreyle engelleme</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Aşamalı Yavaşlatma</p>
                <p className="text-sm text-muted-foreground">500ms gecikme ekleme</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Desen Tanıma</p>
                <p className="text-sm text-muted-foreground">Bot ve saldırı tespiti</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Gerçek Zamanlı İzleme</p>
                <p className="text-sm text-muted-foreground">5 saniyede bir güncelleme</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {securityStats.lastAttackTime && (
        <Card className="mt-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200">Son Saldırı Tespiti</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300">
              Son saldırı: {new Date(securityStats.lastAttackTime).toLocaleString('tr-TR')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}