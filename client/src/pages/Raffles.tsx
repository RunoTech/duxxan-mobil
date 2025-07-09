import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { apiRequest } from '@/lib/queryClient'
import { RaffleCard } from '@/components/RaffleCard'
import { Link } from 'wouter'
import { Plus, Search, Filter, Grid, List, TrendingUp, Star, Clock, Trophy, Users, Zap, SlidersHorizontal, Sparkles, Award } from 'lucide-react'

export default function Raffles() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('endDate')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const itemsPerPage = 12

  const { data: raffles, isLoading } = useQuery({
    queryKey: ['/api/raffles/active'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/raffles/active');
      const result = await response.json();
      return result.data || result || [];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  })

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/categories');
      const result = await response.json();
      return result.data || result || [];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  })

  // Filter and sort logic
  const filteredRaffles = raffles?.filter((raffle: any) => {
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         raffle.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || raffle.categoryId.toString() === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case 'prizeValue':
        return Number(b.prizeValue) - Number(a.prizeValue)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'ticketsSold':
        return b.ticketsSold - a.ticketsSold
      case 'endDate':
      default:
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    }
  }) || []

  // Pagination
  const totalPages = Math.ceil(filteredRaffles.length / itemsPerPage)
  const paginatedRaffles = filteredRaffles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats calculations
  const totalPrize = raffles?.reduce((sum: number, raffle: any) => sum + Number(raffle.prizeValue), 0) || 0
  const totalParticipants = raffles?.reduce((sum: number, raffle: any) => sum + raffle.ticketsSold, 0) || 0
  const endingSoon = raffles?.filter((raffle: any) => {
    const timeLeft = new Date(raffle.endDate).getTime() - new Date().getTime()
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
    return daysLeft <= 3 && daysLeft > 0
  }).length || 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-3 py-4">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 dark:from-yellow-600 dark:via-orange-600 dark:to-red-600 rounded-xl p-4 mb-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h1 className="text-xl font-bold">Ödül Havuzları</h1>
              </div>
              <p className="text-white/90 text-sm">
                Büyük ödüller için ödül havuzlarına katılın ve şansınızı deneyin
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium text-sm">{raffles?.length || 0} Aktif</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-sm">15,000+ Katılımcı</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span className="font-medium text-sm">$2.5M+ Ödül</span>
                </div>
              </div>
            </div>
            <Link href="/create-raffle">
              <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 font-semibold px-6 py-2 rounded-lg shadow-md border-0">
                <Plus className="w-4 h-4 mr-2" />
                Ödül Havuzu Oluştur
              </Button>
            </Link>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Ödül havuzu ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 rounded-xl">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Kategori" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Sırala" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="endDate">Bitiş Tarihi</SelectItem>
                  <SelectItem value="prizeValue">Ödül Miktarı</SelectItem>
                  <SelectItem value="createdAt">Yeni Olanlar</SelectItem>
                  <SelectItem value="ticketsSold">Popüler</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium">Toplam Ödül</p>
                  <p className="text-xl font-bold">${totalPrize.toLocaleString()}</p>
                  <p className="text-white/70 text-xs mt-1">+12% bu ay</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium">Aktif Ödül havuzları</p>
                  <p className="text-xl font-bold">{raffles?.length || 0}</p>
                  <p className="text-white/70 text-xs mt-1">Canlı</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium">Katılımcı</p>
                  <p className="text-xl font-bold">{totalParticipants.toLocaleString()}</p>
                  <p className="text-white/70 text-xs mt-1">+284 bugün</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-xs font-medium">Bitiyor</p>
                  <p className="text-xl font-bold">{endingSoon}</p>
                  <p className="text-white/70 text-xs mt-1">24 saat içinde</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raffles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <div className="h-4 loading-skeleton rounded mb-4"></div>
                  <div className="h-32 loading-skeleton rounded mb-4"></div>
                  <div className="h-4 loading-skeleton rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRaffles?.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Henüz çekiliş bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Filtrenizi kontrol edin veya daha sonra tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-4'}>
            {paginatedRaffles.map((raffle) => (
              <RaffleCard 
                key={raffle.id} 
                raffle={raffle} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-6 py-3 disabled:opacity-50"
            >
              Önceki
            </Button>
            
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 rounded-xl px-4 py-3 shadow-lg" 
                  : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-4 py-3"
                }
              >
                {i + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-6 py-3 disabled:opacity-50"
            >
              Sonraki
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}