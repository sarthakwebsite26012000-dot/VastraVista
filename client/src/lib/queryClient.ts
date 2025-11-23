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
): Promise<any> {
  const sessionId = localStorage.getItem("sessionId");
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (sessionId && (url.includes('/cart') || url.includes('/order') || url.includes('/review'))) {
    headers["x-session-id"] = sessionId;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Extract the base URL (first element)
    let baseUrl = queryKey[0] as string;
    
    // Build the full URL based on the queryKey structure
    let url = baseUrl;
    
    if (queryKey.length > 1) {
      const secondParam = queryKey[1];
      
      // If second parameter is an object, build query string
      if (typeof secondParam === 'object' && secondParam !== null && !Array.isArray(secondParam)) {
        const params = secondParam as Record<string, any>;
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                searchParams.append(key, value.join(','));
              }
            } else {
              searchParams.append(key, String(value));
            }
          }
        });
        
        const queryString = searchParams.toString();
        url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      } 
      // If second parameter is a primitive (string/number), append as path segment
      else if (typeof secondParam === 'string' || typeof secondParam === 'number') {
        // Remove trailing slash from baseUrl to avoid double slashes
        const cleanBase = baseUrl.replace(/\/$/, '');
        url = `${cleanBase}/${secondParam}`;
      }
    }
    
    // Add sessionId header for cart/order/review requests
    const sessionId = localStorage.getItem("sessionId");
    const headers: Record<string, string> = {};
    if (sessionId && (url.includes('/cart') || url.includes('/order') || url.includes('/review'))) {
      headers["x-session-id"] = sessionId;
    }

    const res = await fetch(url, {
      credentials: "include",
      headers,
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
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
