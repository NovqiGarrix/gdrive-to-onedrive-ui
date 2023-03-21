import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";

import authApi from "../apis/auth.api";
import { DeleteFilesModal, FilesContainerWrapper, Navbar } from "../components";

const Home: NextPage = () => {
  return (
    <main className="bg-bg pb-8">
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

    Object.entries({ ...query }).forEach(([key, value]) => {
      if (value && typeof value !== "string") {
        query[key] = undefined;
      }
    });

    if (!query.p1 || !query.p2) {
      const qparams = new URLSearchParams();

      qparams.append("p1", String(query.p1 ?? 0));
      qparams.append("p2", String(query.p1 ?? 2));

      return {
        redirect: {
          destination: `/?${qparams.toString()}`,
          permanent: false,
        },
      };
    }

    // These are providers index
    const p1 = Number(query.p1);
    const p2 = Number(query.p2);

    const p1Path = query.p1_path || null;
    const p2Path = query.p2_path || null;

    return {
      props: {
        me: me ?? null,
        providers: {
          p1,
          p2,
        },
        providerPaths: {
          p1: p1Path,
          p2: p2Path,
        },
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
