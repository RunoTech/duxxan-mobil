import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { isCapacitorApp } from '@/utils/platform';

export function MobileReadOnlyBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(isCapacitorApp());
  }, []);

  if (!showBanner) return null;

  return (
    <Card className="mx-4 my-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Mobil Görüntüleme Modu
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Bu mobil uygulamada ödül havuzlarını ve bağışları görüntüleyebilirsiniz. 
              Katılım ve cüzdan işlemleri için web sitemizi kullanın.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
              onClick={() => window.open('https://duxxan.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Web Sitesi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}