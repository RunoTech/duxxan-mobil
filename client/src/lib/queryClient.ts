import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add wallet address header if available
  const walletConnection = localStorage.getItem('wallet_connection');
  if (walletConnection) {
    try {
      const connection = JSON.parse(walletConnection);
      if (connection.address) {
        headers["X-Wallet-Address"] = connection.address;
        headers["x-chain-id"] = connection.chainId?.toString() || "56";
      }
    } catch (e) {
      // Ignore invalid connection data
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      signal: AbortSignal.timeout(3000), // 3 second timeout for faster response
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true, // Enable automatic refetch on mount
      refetchInterval: false,
      retry: 1, // Reduce retries
      retryDelay: 500, // Faster retry
      staleTime: 10 * 60 * 1000, // 10 minutes cache - keep data longer
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    },
    mutations: {
      retry: 0, // No retries for mutations
      retryDelay: 0,
    },
  },
});
