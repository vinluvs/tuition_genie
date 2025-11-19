"use client";
import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </TanstackQueryClientProvider>
  );
}
