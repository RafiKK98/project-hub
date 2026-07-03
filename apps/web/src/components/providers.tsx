"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 2 minutes — most project data doesn't change that fast.
            // Individual mutations already invalidate the relevant keys.
            staleTime: 2 * 60 * 1000,
            // Keep unused data in cache for 5 minutes — navigation back to a
            // page feels instant because the cache is still warm.
            gcTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              // Never retry auth errors — they won't resolve on their own
              if (
                error instanceof Error &&
                "status" in error &&
                ((error as { status: number }).status === 401 ||
                  (error as { status: number }).status === 403)
              )
                return false;

              return failureCount < 2;
            },
            // Refetch when tab regains focus — catches stale data after
            // the user switches away and comes back
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Mutations should not retry by default — most are non-idempotent
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "font-sans",
          },
        }}
      />
    </QueryClientProvider>
  );
}
