import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Raffle, InsertRaffle, Ticket, User, Category } from '@shared/schema';

export function useRaffles(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['/api/raffles/list'],
    queryFn: ({ pageParam = 0 }) => 
      apiRequest('GET', `/api/raffles?limit=${limit}&offset=${pageParam}`).then(res => res.json()),
    getNextPageParam: (lastPage: any[], allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useActiveRaffles() {
  return useQuery<(Raffle & { creator: User; category: Category })[]>({
    queryKey: ['/api/raffles/active'],
    queryFn: () => apiRequest('GET', '/api/raffles/active').then(res => res.json()),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useRaffleDetail(id: number) {
  return useQuery<Raffle & { creator: User; category: Category }>({
    queryKey: ['/api/raffles/detail', id],
    queryFn: () => apiRequest('GET', `/api/raffles/${id}`).then(res => res.json()),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useRaffleTickets(raffleId: number) {
  return useQuery<(Ticket & { user: User })[]>({
    queryKey: ['/api/raffles/tickets', raffleId],
    queryFn: () => apiRequest('GET', `/api/raffles/${raffleId}/tickets`).then(res => res.json()),
    enabled: !!raffleId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useCreateRaffle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (raffleData: InsertRaffle) => 
      apiRequest('POST', '/api/raffles', raffleData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
    },
  });
}

export function usePurchaseTickets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ raffleId, quantity }: { raffleId: number; quantity: number }) => 
      apiRequest('POST', `/api/raffles/${raffleId}/tickets`, { quantity }).then(res => res.json()),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['raffles', variables.raffleId, 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['raffles', 'detail', variables.raffleId] });
      queryClient.invalidateQueries({ queryKey: ['raffles', 'active'] });
    },
  });
}

export function useUserRaffles(userId: number) {
  return useQuery({
    queryKey: ['/api/users/raffles', userId],
    queryFn: () => apiRequest('GET', `/api/users/${userId}/raffles`).then(res => res.json()),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useRafflesByCategory(categoryId: number) {
  return useQuery({
    queryKey: ['raffles', 'category', categoryId],
    queryFn: () => apiRequest('GET', `/api/raffles?categoryId=${categoryId}`).then(res => res.json()),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}