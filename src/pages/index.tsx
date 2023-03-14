import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";

import authApi from "../apis/auth.api";
import { DeleteFilesModal, FilesContainerWrapper, Navbar } from "../components";

const Home: NextPage = () => {
  return (
    <div className="bg-bg pb-8">
      <Head>
        <title>infile.io | Manage your files in one place</title>
        <meta name="description" content="Manage your files in one place" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <DeleteFilesModal />

      <div className="px-8 lg:px-16 mt-2 md:mt-5 lg:mt-10">
        <FilesContainerWrapper />
      </div>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({
  req: { cookies },
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

    return {
      props: {
        me: me ?? null,
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
