import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Building, Users, Calendar, TrendingUp, Globe, Shield, Info } from 'lucide-react';

// Helper function to format currency
const formatCurrency = (value: string | number) => {
  const num = parseFloat(value.toString());
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num % 1 === 0) {
    return num.toString();
  } else {
    return num.toFixed(1);
  }
};

interface CorporateFundCardProps {
  fund: any;
  onClick?: () => void;
  viewMode?: 'card' | 'list';
}

export default function CorporateFundCard({ fund, onClick, viewMode = 'card' }: CorporateFundCardProps) {
  // Güvenli veri kontrolü
  if (!fund) {
    return null;
  }

  const progress = fund?.target_amount && fund?.current_amount 
    ? (Number(fund.current_amount) / Number(fund.target_amount)) * 100 
    : 0;

  const getOrganizationTypeLabel = (type: string) => {
    if (!type) return 'Diğer';
    const types: { [key: string]: string } = {
      'foundation': 'Vakıf',
      'association': 'Dernek',
      'official': 'Resmi Kurum',
      'corporate': 'Kurumsal'
    };
    return types[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'disaster': 'Afet Yardımı',
      'education': 'Eğitim',
      'health': 'Sağlık',
      'environment': 'Çevre',
      'technology': 'Teknoloji',
      'culture': 'Kültür',
      'sport': 'Spor'
    };
    return categories[category] || category;
  };

  const getOrganizationIcon = (type: string) => {
    switch (type) {
      case 'foundation':
        return <Building className="w-4 h-4" />;
      case 'association':
        return <Users className="w-4 h-4" />;
      case 'official':
        return <Shield className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 card-animate rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Left side - Icon */}
            <div className="flex-shrink-0 p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                {getOrganizationIcon(fund.organization_type)}
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 p-6 pl-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-colors duration-200 cursor-pointer" onClick={onClick}>
                      {fund.name || 'İsimsiz Fon'}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                      {getOrganizationTypeLabel(fund.organization_type)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {fund.description || 'Açıklama bulunmuyor'}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(fund.current_amount || 0)} / {formatCurrency(fund.target_amount || 0)} USDT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getCategoryLabel(fund.category || '')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{(progress || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    onClick={onClick}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Detaylar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 card-animate rounded-xl overflow-hidden h-full flex flex-col cursor-pointer" onClick={onClick}>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-lg">
              {getOrganizationIcon(fund.organization_type)}
            </div>
            <div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                {getOrganizationTypeLabel(fund.organization_type)}
              </Badge>
            </div>
          </div>
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
            {getCategoryLabel(fund.category || '')}
          </Badge>
        </div>
        
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
          {fund.name || 'İsimsiz Fon'}
        </CardTitle>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
          {fund.description || 'Açıklama bulunmuyor'}
        </p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Hedef:</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(fund.target_amount || 0)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplanan:</span>
            </div>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatCurrency(fund.current_amount || 0)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Başlangıç:</span>
            </div>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {fund.created_at ? new Date(fund.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{(progress || 0).toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            onClick={onClick}
          >
            <Info className="w-4 h-4 mr-2" />
            Fon Detayları
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}