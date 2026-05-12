import { QueryClient } from "@tanstack/react-query"

/** Default client used by `<QueryProvider />` (fresh instance per browser session). */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
