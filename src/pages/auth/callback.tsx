import type { NextPage } from "next";
import { useEffect, useRef } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

const CallbackAuthPage: NextPage = () => {
  const router = useRouter();

  const isRedirected = useRef(false);

  useEffect(() => {
    if (isRedirected.current) return;
    const { state } = router.query;

    if (state === "OK") {
      isRedirected.current = true;
      router.replace(`/`);
      return;
    }

    void router.replace("/login");
  }, [router]);

  return (
    <div>
      <Head>
        <title>Wait a moment...</title>
        <meta name="description" content="Redirecting..." />
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p>Redirecting...</p>
    </div>
  );
};

export default CallbackAuthPage;
