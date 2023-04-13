import type { GetServerSideProps, NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import authApi from "../apis/auth.api";
import Image from "next/image";

interface ILoginPageProps {
  authURL: string;
}

const LoginPage: NextPage<ILoginPageProps> = (props) => {
  const { authURL } = props;

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
              width={1080}
              height={720}
              src="/logo.png"
              className="object-cover"
              alt="CloudTransfer.io Logo"
            />
          </div>

          <h2 className="font-poppins font-semibold text-[#092040] text-[32px] mt-10">
            Sign in to your account
          </h2>

          <p className="mt-4 font-poppins text-[#6C707C]">
            Welcome back to CloudTransfer.io
          </p>

          <Link
            href={authURL}
            passHref
            referrerPolicy="no-referrer"
            className="mt-8 w-full h-[66px] rounded-[10px] border border-[#E2E8F0] flex items-center justify-center hover:bg-gray-100"
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
            href={authURL}
            passHref
            referrerPolicy="no-referrer"
            className="mt-4 w-full h-[66px] rounded-[10px] border border-[#E2E8F0] flex items-center justify-center hover:bg-gray-100"
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

          <p className="mt-5 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" passHref className="text-[#2563EB]">
              Create an account
            </Link>
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
