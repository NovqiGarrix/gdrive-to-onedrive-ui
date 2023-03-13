import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";

interface IErrorPageProps {
  code: string;
  message: string;
}

const ErrorPage: NextPage<IErrorPageProps> = (props) => {
  const { code, message } = props;

  return (
    <>
      <Head>
        <title>Something went wrong | infile.io</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="w-full min-h-screen max-h-screen flex items-center justify-center font-roboto">
        <div className="w-full md:max-w-md">
          <div className="text-center text-8xl font-bold text-gray-800">
            {code}
          </div>
          <div className="text-center text-2xl font-bold text-gray-800">
            {message}
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const code = query.code || "500";
  const message = query.message || "Something went wrong";

  return {
    props: {
      code,
      message,
    },
  };
};
