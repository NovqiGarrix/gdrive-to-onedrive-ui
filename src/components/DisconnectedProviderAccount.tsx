import { FunctionComponent } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import type { AccountObject } from "../types";
import signInWithRedirectUrl from "../utils/signInWithRedirectUrl";
import useProviderAccountLoginUrl from "../hooks/useProviderAccountLoginUrl";

interface IDisconnectedProviderAccountProps {
  accountInfo: AccountObject;
}

const DisconnectedProviderAccount: FunctionComponent<
  IDisconnectedProviderAccountProps
> = (props) => {
  const { accountInfo } = props;
  const loginUrl = useProviderAccountLoginUrl((s) => s.url);

  return (
    <div className="mt-[50px] w-full max-w-3xl p-6 bg-purple/10 rounded-[10px]">
      <div className="flex items-center">
        <div className="p-3 bg-purple/[15%] rounded-full">
          <ExclamationTriangleIcon className="w-6 h-6 text-purple" />
        </div>
        <h2 className="font-inter font-medium text-lg text-gray-700 ml-4">
          Provider Account
        </h2>
      </div>

      <p className="ml-[4rem] mt-3 font-inter text-base text-gray-700">
        Your account is not connected to <b>{accountInfo.name}</b> yet! Connect
        your account to access your files.
      </p>

      <button
        role="link"
        type="button"
        onClick={() => signInWithRedirectUrl(loginUrl)}
        className="ml-[4rem] mt-5 rounded-[10px] font-medium px-4 py-2.5 text-sm border bg-purple/90 hover:bg-purple focus:ring-2 focus:ring-offset-2 focus:ring-purple font-inter text-white"
      >
        Connect to {accountInfo.name}
      </button>
    </div>
  );
};

export default DisconnectedProviderAccount;
