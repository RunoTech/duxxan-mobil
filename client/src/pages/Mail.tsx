import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail as MailIcon,
  Send, 
  Star,
  Clock,
  Users,
  Settings,
  Plus,
  Search,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MailMessage {
  id: number;
  fromWalletAddress: string;
  toWalletAddress: string;
  subject: string;
  content: string;
  category: 'system' | 'user' | 'community';
  isRead: boolean;
  isStarred: boolean;
  raffleId?: number;
  communityId?: number;
  createdAt: string;
}

type MailCategory = 'all' | 'system' | 'user' | 'community' | 'starred';

export default function Mail() {
  const { user, isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeCategory, setActiveCategory] = useState<MailCategory>('all');
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [toAddress, setToAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  // Fetch messages with caching
  const { data: messages = [], isLoading } = useQuery<MailMessage[]>({
    queryKey: ['/api/mail/inbox', activeCategory === 'all' ? undefined : activeCategory],
    queryFn: async () => {
      const url = activeCategory === 'all' 
        ? '/api/mail/inbox' 
        : `/api/mail/inbox?category=${activeCategory}`;
      const response = await apiRequest('GET', url);
      const result = await response.json();
      return result.data;
    },
    enabled: isConnected,
    staleTime: 30 * 1000, // 30 seconds cache
  });

  // Unread count with caching
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['/api/mail/unread-count'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/mail/unread-count');
      const result = await response.json();
      return result.data.count;
    },
    enabled: isConnected,
    staleTime: 60 * 1000, // 1 minute cache
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { toWalletAddress: string; subject: string; content: string; }) => {
      const response = await apiRequest('POST', '/api/mail/send', messageData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Mail Gönderildi',
        description: 'Mesajınız başarıyla gönderildi.',
      });
      setIsComposing(false);
      setToAddress('');
      setSubject('');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/mail/inbox'] });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Mail gönderilemedi.',
        variant: 'destructive'
      });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest('PUT', `/api/mail/${messageId}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mail/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mail/unread-count'] });
    }
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async ({ messageId, starred }: { messageId: number; starred: boolean }) => {
      const response = await apiRequest('PUT', `/api/mail/${messageId}/star`, { starred });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mail/inbox'] });
    }
  });

  // Early return for unauthenticated users
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white dark:bg-duxxan-dark flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <MailIcon className="w-16 h-16 text-duxxan-yellow mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-duxxan-text mb-2">DUXXAN Mail</h2>
            <p className="text-duxxan-text-secondary mb-4">
              Cüzdanınızı bağlayın ve dahili mail sisteminize erişin
            </p>
            <Button className="bg-duxxan-yellow text-duxxan-dark">
              Cüzdan Bağla
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!toAddress.trim() || !subject.trim() || !content.trim()) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen tüm alanları doldurun.',
        variant: 'destructive'
      });
      return;
    }

    sendMessageMutation.mutate({
      toWalletAddress: toAddress,
      subject,
      content
    });
  };

  const handleMessageClick = (message: MailMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleStarToggle = (message: MailMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation.mutate({
      messageId: message.id,
      starred: !message.isStarred
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Settings className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      default: return <MailIcon className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'community': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const filteredMessages = messages.filter(message => {
    if (activeCategory === 'starred') {
      return message.isStarred;
    }
    if (searchTerm) {
      return message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
             message.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const userMailAddress = address ? `${address}@duxxan` : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Gmail-style Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MailIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mail</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userMailAddress}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsComposing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Oluştur
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Gmail-style Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-1">
              {[
                { id: 'all', label: 'Gelen Kutusu', icon: <MailIcon className="w-5 h-5" />, count: unreadCount },
                { id: 'starred', label: 'Yıldızlı', icon: <Star className="w-5 h-5" /> },
                { id: 'system', label: 'Sistem', icon: <Settings className="w-5 h-5" /> },
                { id: 'user', label: 'Kişisel', icon: <MailIcon className="w-5 h-5" /> },
                { id: 'community', label: 'Topluluk', icon: <Users className="w-5 h-5" /> },
              ].map((category) => (
                <button
                  key={category.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveCategory(category.id as MailCategory)}
                >
                  {category.icon}
                  <span className="flex-1">{category.label}</span>
                  {category.count && category.count > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gmail-style Message List */}
          <div className="flex-1 bg-white dark:bg-gray-800">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Mail ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-100 dark:bg-gray-700 border-none rounded-full"
                />
              </div>
            </div>

            {/* Message List */}
            <div className="overflow-y-auto h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <MailIcon className="w-16 h-16 mb-4 text-gray-300" />
                  <p>Mesaj bulunamadı</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${!message.isRead ? 'bg-blue-25 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <button
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        onClick={(e) => handleStarToggle(message, e)}
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            message.isStarred 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`} 
                        />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm ${!message.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                            {message.fromWalletAddress === 'system@duxxan' 
                              ? 'DUXXAN Sistemi' 
                              : `${message.fromWalletAddress.slice(0, 6)}...${message.fromWalletAddress.slice(-4)}`
                            }
                          </span>
                          <Badge variant="outline" className={`text-xs ${getCategoryColor(message.category)}`}>
                            {message.category}
                          </Badge>
                        </div>
                        
                        <h4 className={`text-sm mb-1 truncate ${
                          !message.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {message.subject}
                        </h4>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {message.content.substring(0, 100)}...
                        </p>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(message.createdAt), { 
                          addSuffix: true, 
                          locale: tr 
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gmail-style Message Detail Panel */}
          {selectedMessage && (
            <div className="w-2/3 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
              {/* Message Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Geri
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleStarToggle(selectedMessage, e)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          selectedMessage.isStarred 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {selectedMessage.subject}
                  </h1>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        {getCategoryIcon(selectedMessage.category)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {selectedMessage.fromWalletAddress === 'system@duxxan' 
                            ? 'DUXXAN Sistemi' 
                            : `${selectedMessage.fromWalletAddress}@duxxan`
                          }
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(selectedMessage.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={`ml-auto ${getCategoryColor(selectedMessage.category)}`}>
                      {selectedMessage.category}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Message Content */}
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.content}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gmail-style Compose Dialog */}
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogContent className="sm:max-w-[700px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl" aria-describedby="compose-mail-description">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Yeni Mail</DialogTitle>
              <div id="compose-mail-description" className="text-sm text-gray-500 dark:text-gray-400">
                Yeni bir mail mesajı oluşturun
              </div>
            </DialogHeader>
            
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="to" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alıcı
                  </Label>
                  <Input
                    id="to"
                    placeholder="0x... (wallet adresi)"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Otomatik olarak @duxxan uzantısı eklenecek
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Konu
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Mesaj konusu..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mesaj
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Mesajınızı buraya yazın..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setIsComposing(false)}
                  className="px-6 py-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  İptal
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}