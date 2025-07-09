import { useState, memo } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Menu, Sun, Moon, Wallet, ArrowUpRight, Home, Trophy, Heart, Users, User, Mail, Inbox, MailIcon } from 'lucide-react';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useTheme } from '@/components/ThemeProvider';
import { useMailCount } from '@/hooks/useMailCount';

function NavigationComponent() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const { data: unreadCount = 0 } = useMailCount();

  const navItems = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/raffles', label: 'Ödül Havuzları' },
    { href: '/donations', label: 'Bağışlar' },
    { href: '/corporate-funds', label: 'Fonlar' },
    { href: '/community', label: 'Topluluk' },
  ];

  const NavLinks = ({ mobile = false, compact = false, className = '' }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`font-semibold transition-colors hover:text-primary ${
            location === item.href ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
          } ${mobile ? 'block py-2 text-base border-b border-border last:border-b-0 mobile-menu-item' : ''} ${compact ? 'text-xs' : 'text-sm'}`}
          onClick={() => mobile && setIsOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold" style={{ color: '#FFC929' }}>
            DUXXAN
          </Link>

          {/* Desktop/Tablet Navigation */}
          <div className="hidden custom-md:flex items-center space-x-4 xl:space-x-8">
            <NavLinks compact />
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Theme Toggle - Desktop Only */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="hidden custom-md:flex text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white h-10 w-10"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Wallet Connection - Desktop/Tablet Only */}
            <div className="hidden custom-md:block">
              {isConnected ? (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-2 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Cüzdan Bağlı</span>
                    </div>
                    
                    <div className="h-4 w-px bg-green-300 dark:bg-green-600"></div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">BSC</span>
                      <code className="text-xs font-mono text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800/50 px-1.5 py-0.5 rounded">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </code>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => {
                          if (address) {
                            navigator.clipboard.writeText(address);
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-200 dark:hover:bg-green-700 text-green-600 dark:text-green-400"
                        title="Adresi Kopyala"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </Button>
                      
                      <Button
                        onClick={() => window.open(`https://bscscan.com/address/${address}`, '_blank')}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-200 dark:hover:bg-green-700 text-green-600 dark:text-green-400"
                        title="BSC Scan'de Görüntüle"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        onClick={disconnectWallet}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 ml-2"
                        title="Cüzdanı Bağlantısını Kes"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Dialog open={isWalletDialogOpen} onOpenChange={(open) => {
                  if (open) {
                    // Trigger wallet detection when dialog opens
                    import('@/lib/wallet').then(({ walletManager }) => {
                      walletManager.checkAvailableWallets();
                    });
                  }
                  setIsWalletDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black">
                      <Wallet className="mr-2 h-4 w-4" />
                      Cüzdan Bağla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <DialogHeader className="text-center pb-2">
                      <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Cüzdan Bağlantısı</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Devam etmek için cüzdanınızı seçin
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      <Button
                        onClick={async () => {
                          await connectWallet('metamask');
                          setIsWalletDialogOpen(false);
                        }}
                        disabled={isConnecting}
                        className="w-full h-20 justify-start space-x-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30 border-2 border-orange-200 dark:border-orange-700 text-gray-900 dark:text-white transition-all duration-200"
                        variant="outline"
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M26.6 5.9L17.8 1.4C16.7 0.9 15.3 0.9 14.2 1.4L5.4 5.9C4.3 6.4 3.6 7.5 3.6 8.7V23.3C3.6 24.5 4.3 25.6 5.4 26.1L14.2 30.6C14.7 30.9 15.3 31 16 31C16.7 31 17.3 30.9 17.8 30.6L26.6 26.1C27.7 25.6 28.4 24.5 28.4 23.3V8.7C28.4 7.5 27.7 6.4 26.6 5.9Z" fill="#F6851B"/>
                            <path d="M26.6 5.9L17.8 1.4C16.7 0.9 15.3 0.9 14.2 1.4L5.4 5.9C4.3 6.4 3.6 7.5 3.6 8.7V23.3C3.6 24.5 4.3 25.6 5.4 26.1L14.2 30.6C14.7 30.9 15.3 31 16 31C16.7 31 17.3 30.9 17.8 30.6L26.6 26.1C27.7 25.6 28.4 24.5 28.4 23.3V8.7C28.4 7.5 27.7 6.4 26.6 5.9Z" fill="url(#paint0_linear)"/>
                            <defs>
                              <linearGradient id="paint0_linear" x1="16" y1="1" x2="16" y2="31" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#F6851B"/>
                                <stop offset="1" stopColor="#E2761B"/>
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-lg">MetaMask</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">En popüler kripto cüzdanı</div>
                        </div>
                        <div className="text-orange-600 dark:text-orange-400">
                          <Wallet className="w-5 h-5" />
                        </div>
                      </Button>
                      
                      <Button
                        onClick={async () => {
                          await connectWallet('trustwallet');
                          setIsWalletDialogOpen(false);
                        }}
                        disabled={isConnecting}
                        className="w-full h-20 justify-start space-x-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-700 text-gray-900 dark:text-white transition-all duration-200"
                        variant="outline"
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="url(#paint0_linear_trust)"/>
                            <path d="M16 4L8 9V15C8 20.55 11.84 25.74 16 26C20.16 25.74 24 20.55 24 15V9L16 4Z" fill="white"/>
                            <path d="M16 6L10 10V15C10 19.42 13.13 23.78 16 24C18.87 23.78 22 19.42 22 15V10L16 6Z" fill="#3375BB"/>
                            <defs>
                              <linearGradient id="paint0_linear_trust" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#3375BB"/>
                                <stop offset="1" stopColor="#1A4B8C"/>
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-lg">Trust Wallet</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Mobil ve güvenli cüzdan</div>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          <Wallet className="w-5 h-5" />
                        </div>
                      </Button>
                      
                      {isConnecting && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-duxxan-yellow"></div>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Bağlanıyor...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                        Cüzdan bağlayarak <span className="font-medium">Kullanım Şartları</span> ve <span className="font-medium">Gizlilik Politikası</span>'nı kabul etmiş olursunuz.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Profile and Mail Icons for connected users */}
            {isConnected && address && (
              <div className="hidden custom-md:flex items-center gap-2">
                <Link href="/mail">
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white relative">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {/* Mail notification badge with real unread count */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="text-gray-600 dark:text-duxxan-text-secondary hover:text-gray-900 dark:hover:text-white">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="custom-md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="flex items-center justify-center h-10 w-10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-0 transition-colors duration-300">
                <div className="h-full flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Menü</SheetTitle>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4 space-y-6">
                      {/* Navigation Links */}
                      <div className="space-y-1">
                        <Link
                          href="/"
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            location === '/' 
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Home className="w-5 h-5" />
                          Ana Sayfa
                        </Link>
                        <Link
                          href="/raffles"
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            location === '/raffles' 
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Trophy className="w-5 h-5" />
                          Çekilişler
                        </Link>
                        <Link
                          href="/donations"
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            location === '/donations' 
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Heart className="w-5 h-5" />
                          Bağışlar
                        </Link>
                        <Link
                          href="/community"
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            location === '/community' 
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Users className="w-5 h-5" />
                          Topluluk
                        </Link>
                      </div>
                  
                      {/* Profile Section - Only for connected users */}
                      {isConnected && address && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">Profil</h3>
                          <div className="space-y-1">
                            <Link href="/profile" onClick={() => setIsOpen(false)}>
                              <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <User className="w-5 h-5 text-blue-500" />
                                Profilim
                              </div>
                            </Link>
                            <Link href="/mail" onClick={() => setIsOpen(false)}>
                              <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                                <svg
                                  className="w-5 h-5 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                Mesajlar
                                {unreadCount > 0 && (
                                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                  
                      {/* Wallet Section */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">Cüzdan</h3>
                        {isConnected ? (
                          <div className="space-y-3">
                            <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bağlı Cüzdan</div>
                              <div className="text-sm font-mono text-gray-900 dark:text-white">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                              </div>
                            </div>
                            <Button 
                              onClick={disconnectWallet} 
                              variant="outline" 
                              className="w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Bağlantıyı Kes
                            </Button>
                          </div>
                        ) : (
                      <Dialog open={isWalletDialogOpen} onOpenChange={(open) => {
                        if (open) {
                          // Trigger wallet detection when dialog opens
                          import('@/lib/wallet').then(({ walletManager }) => {
                            walletManager.checkAvailableWallets();
                          });
                        }
                        setIsWalletDialogOpen(open);
                      }}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm">
                              <Wallet className="mr-2 h-4 w-4" />
                              Cüzdan Bağla
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                          <DialogHeader className="text-center pb-2">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Cüzdan Bağlantısı</DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Devam etmek için cüzdanınızı seçin
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 py-4">
                            <Button
                              onClick={async () => {
                                await connectWallet('metamask');
                                setIsWalletDialogOpen(false);
                                setIsOpen(false);
                              }}
                              disabled={isConnecting}
                              className="w-full h-20 justify-start space-x-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 dark:hover:from-orange-900/30 dark:hover:to-amber-900/30 border-2 border-orange-200 dark:border-orange-700 text-gray-900 dark:text-white transition-all duration-200"
                              variant="outline"
                            >
                              <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M26.6 5.9L17.8 1.4C16.7 0.9 15.3 0.9 14.2 1.4L5.4 5.9C4.3 6.4 3.6 7.5 3.6 8.7V23.3C3.6 24.5 4.3 25.6 5.4 26.1L14.2 30.6C14.7 30.9 15.3 31 16 31C16.7 31 17.3 30.9 17.8 30.6L26.6 26.1C27.7 25.6 28.4 24.5 28.4 23.3V8.7C28.4 7.5 27.7 6.4 26.6 5.9Z" fill="#F6851B"/>
                                  <path d="M26.6 5.9L17.8 1.4C16.7 0.9 15.3 0.9 14.2 1.4L5.4 5.9C4.3 6.4 3.6 7.5 3.6 8.7V23.3C3.6 24.5 4.3 25.6 5.4 26.1L14.2 30.6C14.7 30.9 15.3 31 16 31C16.7 31 17.3 30.9 17.8 30.6L26.6 26.1C27.7 25.6 28.4 24.5 28.4 23.3V8.7C28.4 7.5 27.7 6.4 26.6 5.9Z" fill="url(#paint0_linear_mobile)"/>
                                  <defs>
                                    <linearGradient id="paint0_linear_mobile" x1="16" y1="1" x2="16" y2="31" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#F6851B"/>
                                      <stop offset="1" stopColor="#E2761B"/>
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </div>
                              <div className="text-left flex-1">
                                <div className="font-bold text-lg">MetaMask</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">En popüler kripto cüzdanı</div>
                              </div>
                              <div className="text-orange-600 dark:text-orange-400">
                                <Wallet className="w-5 h-5" />
                              </div>
                            </Button>
                            
                            <Button
                              onClick={async () => {
                                await connectWallet('trustwallet');
                                setIsWalletDialogOpen(false);
                                setIsOpen(false);
                              }}
                              disabled={isConnecting}
                              className="w-full h-20 justify-start space-x-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-700 text-gray-900 dark:text-white transition-all duration-200"
                              variant="outline"
                            >
                              <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="32" height="32" rx="8" fill="url(#paint0_linear_trust_mobile)"/>
                                  <path d="M16 4L8 9V15C8 20.55 11.84 25.74 16 26C20.16 25.74 24 20.55 24 15V9L16 4Z" fill="white"/>
                                  <path d="M16 6L10 10V15C10 19.42 13.13 23.78 16 24C18.87 23.78 22 19.42 22 15V10L16 6Z" fill="#3375BB"/>
                                  <defs>
                                    <linearGradient id="paint0_linear_trust_mobile" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#3375BB"/>
                                      <stop offset="1" stopColor="#1A4B8C"/>
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </div>
                              <div className="text-left flex-1">
                                <div className="font-bold text-lg">Trust Wallet</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Mobil ve güvenli cüzdan</div>
                              </div>
                              <div className="text-blue-600 dark:text-blue-400">
                                <Wallet className="w-5 h-5" />
                              </div>
                            </Button>
                            
                            {isConnecting && (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-duxxan-yellow"></div>
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Bağlanıyor...</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                              Cüzdan bağlayarak <span className="font-medium">Kullanım Şartları</span> ve <span className="font-medium">Gizlilik Politikası</span>'nı kabul etmiş olursunuz.
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                        )}
                      </div>
                      
                      {/* Theme Toggle */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">Tema</h3>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 relative overflow-hidden">
                          {/* Sliding indicator */}
                          <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-white dark:bg-gray-700 rounded-md shadow-sm transition-transform duration-300 ease-out ${
                              theme === 'light' ? 'translate-x-0' : 'translate-x-[calc(100%+4px)]'
                            }`}
                          />
                          <div className="grid grid-cols-2 gap-1 relative z-10">
                            <Button
                              onClick={() => {
                                if (theme === 'dark') {
                                  toggleTheme();
                                }
                              }}
                              variant="ghost"
                              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
                                theme === 'light' 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <Sun className={`w-4 h-4 transition-all duration-300 ${theme === 'light' ? 'text-yellow-500' : ''}`} />
                              Açık
                            </Button>
                            <Button
                              onClick={() => {
                                if (theme === 'light') {
                                  toggleTheme();
                                }
                              }}
                              variant="ghost"
                              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
                                theme === 'dark' 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <Moon className={`w-4 h-4 transition-all duration-300 ${theme === 'dark' ? 'text-blue-400' : ''}`} />
                              Koyu
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export const Navigation = memo(NavigationComponent);
