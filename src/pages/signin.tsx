import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import authApi from "../apis/auth.api";

interface ILoginPageProps {
  googleAuthURL: string;
  microsoftAuthURL: string;

  message: string | null;
}

const LoginPage: NextPage<ILoginPageProps> = (props) => {
  const { googleAuthURL, microsoftAuthURL, message: errorMessage } = props;

  return (
    <div className="min-h-screen grid grid-cols-2 w-full">
      <Head>
        <title>Sign in | CloudTransfer.io</title>
        <meta
          name="description"
          content="Transfer your files across multiple cloud storage providers with CloudTransfer.io. Sign in now!"
        />
      </Head>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="w-52">
            <Image
              priority
              width={1080}
              height={720}
              src="/logo.webp"
              className="object-cover"
              alt="CloudTransfer.io Logo"
            />
          </div>

          <h2 className="font-poppins font-semibold text-[#092040] text-[32px] mt-10">
            Sign in to your account
          </h2>

          {!errorMessage ? (
            <p className="mt-4 font-poppins text-[#6C707C]">
              Welcome back to CloudTransfer.io
            </p>
          ) : (
            <p className="text-red-500 mt-4 text-sm">{errorMessage}</p>
          )}

          <Link
            passHref
            href={googleAuthURL}
            referrerPolicy="no-referrer"
            className="mt-8 w-full h-[66px] select-none rounded-[10px] border border-[#E2E8F0] flex items-center justify-center hover:bg-gray-100"
          >
            <Image
              src="/google.webp"
              alt="Google"
              width={24}
              height={24}
              className="object-cover"
            />

            <p className="font-poppins text-[#092040] ml-4">
              Sign in with Google
            </p>
          </Link>

          <Link
            passHref
            href={microsoftAuthURL}
            referrerPolicy="no-referrer"
            className="mt-4 w-full h-[66px] select-none rounded-[10px] border border-[#E2E8F0] flex items-center justify-center hover:bg-gray-100"
          >
            <Image
              src="/microsoft.png"
              alt="Google"
              width={24}
              height={24}
              className="object-cover"
            />

            <p className="font-poppins text-[#092040] ml-4">
              Sign in with Microsoft
            </p>
          </Link>

          <p className="mt-5 text-center text-sm text-[#6C707C]">
            If you don&apos;t have an account, you can sign up with{" "}
            <b className="text-primary">Google</b> or{" "}
            <b className="text-primary">Microsoft</b>
          </p>
        </div>
      </div>

      <div
        className="relative"
        style={{
          background: "url('/login-right.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute bottom-16 mx-auto w-full">
          <h3 className="text-xl font-semibold font-poppins text-center text-white">
            Easy, secure, and blazingly fast
          </h3>
          <p className="text-base font-normal font-inter text-center mt-1 text-[#AFD0FF]">
            Transfer your files across multiple cloud storage providers
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const me = await authApi.getMe(req.cookies.qid);
  if (me) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const [googleAuthURL, microsoftAuthURL] = await Promise.all([
    authApi.getGoogleAuthUrl(),
    authApi.getMicorosftAuthUrl(),
  ]);

  return {
    props: {
      googleAuthURL,
      microsoftAuthURL,
      message:
        query.state === "NOTOK"
          ? query.message || "Something went wrong"
          : null,
    },
  };
};
