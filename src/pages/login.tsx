import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import authApi from "../apis/auth.api";

interface ILoginPageProps {
  authURL: string;
}

const LoginPage: NextPage<ILoginPageProps> = (props) => {
  const { authURL } = props;

  return (
    <div className="bg-bg min-h-screen flex items-center justify-center w-full">
      <Head>
        <title>Login | Cloudtransfer.io</title>
        <meta name="description" content="Login to cloudtransfer.io" />
      </Head>

      <div>
        <Link
          href={authURL}
          referrerPolicy="no-referrer"
          className="btn btn-primary"
          passHref
        >
          Log In with Google
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const me = await authApi.getMe(req.cookies.qid);
  if (me) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const authURL = await authApi.getAuthURL();

  return {
    props: {
      authURL,
    },
  };
};
