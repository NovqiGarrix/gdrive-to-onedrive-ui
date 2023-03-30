import { useMemo, useState } from "react";
import type { NextPage, GetServerSideProps } from "next";

import Head from "next/head";

import authApi from "../apis/auth.api";
import classNames from "../utils/classNames";
import { AccountSettings } from "../components";

const SettingsPage: NextPage = () => {
  const [currentSetting, setCurrentSetting] = useState(0);

  const settings = useMemo(() => {
    return [
      {
        title: "Account",
        Component: () => <AccountSettings />,
      },
    ];
  }, []);

  return (
    <main className="bg-bg pb-8 min-h-screen">
      <Head>
        <title>Settings | infile.io</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-3xl w-full mx-auto pt-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-5xl text-gray-700 font-bold">Settings</h1>
          <div className="w-24 h-0.5 border-dashed border-gray-500 border"></div>
        </div>

        <div className="flex items-start space-x-5 w-full mt-5">
          <ul className="w-full max-w-[13rem] flex-shrink-0">
            {settings.map((setting, index) => (
              <li
                role="button"
                key={setting.title}
                onClick={() => setCurrentSetting(index)}
                className={classNames(
                  "px-5 cursor-pointer rounded-full py-1.5 border border-gray-300 bg-white hover:bg-gray-50 font-medium",
                  index === currentSetting
                    ? "text-gray-600 bg-white/80"
                    : "text-gray-600 bg-gray-200"
                )}
              >
                <button type="button">{setting.title}</button>
              </li>
            ))}
          </ul>

          {settings[currentSetting].Component()}
        </div>
      </div>
    </main>
  );
};
export default SettingsPage;

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
