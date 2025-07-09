import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info } from 'lucide-react';

export function USDTRequirement() {
  const openPancakeSwap = () => {
    window.open('https://pancakeswap.finance/swap?outputCurrency=0x55d398326f99059fF775485246999027B3197955', '_blank');
  };

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <div className="space-y-2">
          <p className="font-medium">Platform sadece USDT token kabul ediyor</p>
          <p className="text-sm">
            BNB ile ödeme yapamazsınız. İşlemler için USDT token gerekli.
          </p>
          <Button
            onClick={openPancakeSwap}
            size="sm"
            variant="outline"
            className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            BNB → USDT Swap (PancakeSwap)
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}