import { Fragment, useEffect, useRef } from "react";
import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

import authApi from "../apis/auth.api";
import {
  Navbar,
  Sidebar,
  UploadArea,
  Folders,
  FilesContainerWrapper,
  LoadingIcon,
  Breadcrumbs,
  BeautifulError,
  ScrollToTop,
} from "../components";

import useProviderPath, {
  initializedProviderPath,
} from "../hooks/useProviderPath";
import useSelectedFiles from "../hooks/useSelectedFiles";
import { initializeCloudProvider } from "../hooks/useCloudProvider";
import useGetProviderAccountInfo from "../hooks/useGetProviderAccountInfo";

const Settings = dynamic(() => import("../components/Settings"));
const DisconnectedProviderAccount = dynamic(
  () => import("../components/DisconnectedProviderAccount")
);

interface IHomePageProps {
  path: string | null;
  provider: string | null;
}

const Home: NextPage<IHomePageProps> = (props) => {
  const { path, provider } = props;

  const router = useRouter();
  const rightComponentRef = useRef<HTMLDivElement>(null);

  const providerPath = useProviderPath((s) => s.path);
  const setProviderPath = useProviderPath((s) => s.setPath);

  const selectedFiles = useSelectedFiles((s) => s.files, shallow);
  const cleanSelectedFiles = useSelectedFiles((s) => s.cleanFiles);

  const {
    data: providerAccountInfo,
    isLoading: isGettingProviderAccountInfo,
    isError: isProviderAccountInfoError,
    error: providerAccountInfoError,
  } = useGetProviderAccountInfo();

  useEffect(() => {
    /**
     * This hook just initializes the state of the provider and path
     * from the query params
     *
     * That's all it is
     */

    initializeCloudProvider(provider);
    initializedProviderPath(path);

    /**
     * Don't want to manage the state when the provider and path changes
     * Instead, the state will be managed by the useCloudProvider and useProviderPath hooks
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = rightComponentRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const fileOptionsEl = document.getElementById("file-options");
      const transferFilesModalEl = document.getElementById(
        "transfer-files-modal"
      );
      const deleteFilesModal = document.getElementById("delete-files-modal");

      const shouldClean =
        !target.getAttribute("data-id") &&
        !fileOptionsEl?.contains(target) &&
        !transferFilesModalEl?.contains(target) &&
        !deleteFilesModal?.contains(target);
      if (!shouldClean || !selectedFiles.length) return;
      cleanSelectedFiles();
    };

    el?.addEventListener("mousedown", handleMouseDown);

    return () => {
      el?.removeEventListener("mousedown", handleMouseDown);
    };
  }, [cleanSelectedFiles, selectedFiles.length]);

  return (
    <main className="bg-white pb-8 relative inline-flex overflow-x-hidden w-full">
      <Head>
        <title>Dashboard | cloudtransfer.io</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />
      <Settings />

      <div
        ref={rightComponentRef}
        className="py-[40px] pl-[42px] pr-[35px] w-full"
      >
        <Navbar />
        {isGettingProviderAccountInfo ? (
          <div className="w-full mt-[50px] min-h-[70vh] flex items-center justify-center">
            <LoadingIcon className="w-10 h-10" fill="rgb(114 93 255)" />
          </div>
        ) : isProviderAccountInfoError ? (
          <BeautifulError.Root>
            <BeautifulError.Title title="Something went wrong" />
            <BeautifulError.Message
              message={providerAccountInfoError?.message!}
            />
            <BeautifulError.Button onClick={() => router.reload()}>
              Reload Page
            </BeautifulError.Button>
          </BeautifulError.Root>
        ) : !providerAccountInfo?.isConnected ? (
          // Show some message and a button to connect the account
          <DisconnectedProviderAccount accountInfo={providerAccountInfo!} />
        ) : (
          <Fragment>
            <UploadArea />
            <Breadcrumbs path={providerPath} setPath={setProviderPath} />
            <Folders />
            <FilesContainerWrapper />
            <ScrollToTop />
          </Fragment>
        )}
      </div>
    </main>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({
  req: { cookies },
  query,
}) => {
  try {
    const me = await authApi.getMe(cookies.qid);

    if (!me) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    Object.entries(query).forEach(([key, value]) => {
      if (value && typeof value !== "string") {
        query[key] = undefined;
      }
    });

    return {
      props: {
        me,
        path: query.path || null,
        provider: query.provider || null,
      },
    };
  } catch (error: any) {
    return {
      redirect: {
        destination: `/error?code=${error.status || 500}&message=${
          error.message
        }`,
        permanent: false,
      },
    };
  }
};
