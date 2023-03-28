import "../styles/globals.css";
import { useEffect } from "react";
import type { AppProps } from "next/app";

import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { initUserStore } from "../hooks/useUser";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps, router }: AppProps) {
  initUserStore(pageProps.me);
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
