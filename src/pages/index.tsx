import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";

import authApi from "../apis/auth.api";
import { Navbar, Sidebar, UploadArea } from "../components";

import { initializeCloudProvider } from "../hooks/useCloudProvider";
import { initializedProviderPath } from "../hooks/useProviderPath";

const Home: NextPage = () => {
  return (
    <main className="bg-white pb-8 relative inline-flex w-full">
      <Head>
        <title>infile.io | Manage your files in one place</title>
        <meta name="description" content="Manage your files in one place" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />
      <div className="py-[40px] pl-[42px] pr-[35px] w-full">
        <Navbar />
        <UploadArea />
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

    initializeCloudProvider(query.provider as string);
    initializedProviderPath(query.provider_path as string);

    return {
      props: {
        me,
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
