import "../styles/globals.css";
import type { AppProps } from "next/app";

import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { initUserStore } from "../hooks/useUser";
import { initializeUsedProviders } from "../hooks/useUsedProviders";
import { useEffect } from "react";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  initUserStore(pageProps.me);

  useEffect(() => {
    initializeUsedProviders(pageProps.providers);

    // Just to make sure that the providers is coming from the server
    // and not change by the client

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
