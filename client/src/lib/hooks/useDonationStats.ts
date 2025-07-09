import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Donation, InsertDonation, DonationContribution, User } from '@shared/schema';

export function useDonations(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['/api/donations/list'],
    queryFn: ({ pageParam = 0 }) => 
      apiRequest('GET', `/api/donations?limit=${limit}&offset=${pageParam}`).then(res => res.json()),
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

export function useActiveDonations() {
  return useQuery<(Donation & { creator: User })[]>({
    queryKey: ['/api/donations/active'],
    queryFn: () => apiRequest('GET', '/api/donations/active').then(res => res.json()),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useDonationDetail(id: number) {
  return useQuery<Donation & { creator: User }>({
    queryKey: ['/api/donations/detail', id],
    queryFn: () => apiRequest('GET', `/api/donations/${id}`).then(res => res.json()),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useDonationContributions(donationId: number) {
  return useQuery<(DonationContribution & { user: User })[]>({
    queryKey: ['/api/donations/contributions', donationId],
    queryFn: () => apiRequest('GET', `/api/donations/${donationId}/contributions`).then(res => res.json()),
    enabled: !!donationId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useDonationStats() {
  return useQuery({
    queryKey: ['/api/donations/stats'],
    queryFn: () => apiRequest('GET', '/api/donations/stats').then(res => res.json()),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (donationData: InsertDonation) => 
      apiRequest('POST', '/api/donations', donationData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

export function useContributeToDonation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ donationId, amount }: { donationId: number; amount: number }) => 
      apiRequest('POST', `/api/donations/${donationId}/contribute`, { amount }).then(res => res.json()),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donations', variables.donationId, 'contributions'] });
      queryClient.invalidateQueries({ queryKey: ['donations', 'detail', variables.donationId] });
      queryClient.invalidateQueries({ queryKey: ['donations', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['donations', 'stats'] });
    },
  });
}

export function useDonationsByOrganization(orgType: string) {
  return useQuery({
    queryKey: ['donations', 'organization', orgType],
    queryFn: () => apiRequest('GET', `/api/donations?orgType=${orgType}`).then(res => res.json()),
    enabled: !!orgType,
    staleTime: 2 * 60 * 1000,
  });
}