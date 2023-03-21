import "../styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";

import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { initUserStore } from "../hooks/useUser";
import { initializeUsedProviders } from "../hooks/useUsedProviders";
import { initializedProviderPathStore } from "../hooks/useProviderPath";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  initUserStore(pageProps.me);

  useEffect(() => {
    initializeUsedProviders(pageProps.providers);
    initializedProviderPathStore(pageProps.providerPaths);
  }, [pageProps.providerPaths, pageProps.providers]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
