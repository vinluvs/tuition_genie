
import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient with a conservative retry/backoff policy:
 * - retry up to 3 times for network errors and 5xx responses
 * - do NOT retry for 4xx client errors
 * - exponential backoff with jitter (min 500ms base)
 *
 * Note: React Query v5 renamed `cacheTime` -> `gcTime` (garbage-collect time).
 */

function shouldRetry(failureCount: number, error: any) {
  if (failureCount >= 3) return false;

  const status = error?.status ?? error?.response?.status ?? error?.statusCode;

  if (typeof status === 'number') {
    if (status >= 400 && status < 500) return false; // client errors: don't retry
    if (status >= 500) return true; // server errors: retry
  }

  // Retry on network errors (no status)
  if (!status) return true;

  return true;
}

/** Exponential backoff with jitter (ms) */
function retryDelay(failureCount: number) {
  const base = 500;
  const exp = Math.min(base * 2 ** (failureCount - 1 || 0), 30_000);
  const jitter = Math.floor(Math.random() * 200) - 100;
  return Math.max(0, exp + jitter);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => shouldRetry(failureCount, error),
      retryDelay: (failureCount: number) => retryDelay(failureCount),
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // garbage collect inactive queries after 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: (failureCount: number, error: unknown) => {
        if (failureCount >= 2) return false;
        return shouldRetry(failureCount, error);
      },
      retryDelay: (failureCount: number) => retryDelay(failureCount),
    },
  },
});
