import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";
import { Fragment, useEffect } from "react";

import authApi from "../apis/auth.api";
import {
  Navbar,
  Sidebar,
  UploadArea,
  Folders,
  FilesContainerWrapper,
  LoadingIcon,
  DisconnectedProviderAccount,
  Breadcrumbs,
} from "../components";

import { initializeCloudProvider } from "../hooks/useCloudProvider";
import useProviderPath, {
  initializedProviderPath,
} from "../hooks/useProviderPath";
import useGetProviderAccountInfo from "../hooks/useGetProviderAccountInfo";
import BeautifulError from "../components/BeautifulError";
import { useRouter } from "next/router";

interface IHomePageProps {
  path: string | null;
  provider: string | null;
}

const Home: NextPage<IHomePageProps> = (props) => {
  const { path, provider } = props;

  const router = useRouter();
  const providerPath = useProviderPath((s) => s.path);
  const setProviderPath = useProviderPath((s) => s.setPath);

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

  return (
    <main className="bg-white pb-8 relative inline-flex overflow-x-hidden w-full">
      <Head>
        <title>infile.io | Manage your files in one place</title>
        <meta name="description" content="Manage your files in one place" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />
      <div className="py-[40px] pl-[42px] pr-[35px] w-full">
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
