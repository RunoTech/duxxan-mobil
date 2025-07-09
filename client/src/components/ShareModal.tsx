import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Twitter, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
}

export function ShareModal({ isOpen, onClose, title, description, url }: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${url}`;
  const shareText = `${title} - DUXXAN'da bu çekilişe katıl! 🎁`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Başarılı!",
        description: "Link kopyalandı",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Hata",
        description: "Link kopyalanamadı",
        variant: "destructive",
      });
    }
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-duxxan-surface border-duxxan-border">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Çekilişi Paylaş
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-2">{title}</h3>
            <p className="text-duxxan-text-secondary text-sm">{description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-duxxan-card border-duxxan-border text-white"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="duxxan-button-secondary"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={shareOnTwitter}
              className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white border-0"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            
            <Button
              onClick={shareOnFacebook}
              className="bg-[#4267B2] hover:bg-[#365899] text-white border-0"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            
            <Button
              onClick={shareOnWhatsApp}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white border-0"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button
              onClick={shareOnTelegram}
              className="bg-[#0088cc] hover:bg-[#006ba3] text-white border-0"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.568 8.16c-.18 1.896-.96 6.504-1.356 8.628-.168.9-.504 1.2-.816 1.236-.696.06-1.224-.456-1.896-.9-1.056-.696-1.656-1.128-2.676-1.8-1.188-.78-.42-1.212.264-1.908.18-.18 3.252-2.976 3.312-3.228a.24.24 0 0 0-.06-.216c-.072-.06-.168-.036-.252-.024-.108.024-1.788 1.14-5.064 3.348-.48.336-.912.492-1.296.492-.432-.012-1.248-.24-1.86-.444-.756-.24-1.344-.372-1.296-.792.024-.216.324-.432.888-.66 3.504-1.524 5.832-2.532 6.996-3.012 3.336-1.392 4.02-1.632 4.476-1.632.096 0 .324.024.468.144.12.096.156.228.168.324-.012.072-.012.288-.024.456z"/>
              </svg>
              Telegram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}