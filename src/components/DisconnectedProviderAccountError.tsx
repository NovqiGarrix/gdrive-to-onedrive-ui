import type { FunctionComponent } from "react";

import { useRouter } from "next/router";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

interface IDisconnectedProviderAccountProps {
  error: HttpErrorExeption;
}

const DisconnectedProviderAccount: FunctionComponent<
  IDisconnectedProviderAccountProps
> = (props) => {
  const { error } = props;

  const router = useRouter();

  return (
    <div className="mt-[50px] w-full max-w-3xl p-6 bg-red-100 rounded-[10px]">
      <div className="flex items-center">
        <div className="p-3 bg-red-500 rounded-full">
          <ExclamationTriangleIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="font-inter font-medium text-lg text-gray-700 ml-4">
          Something went wrong
        </h2>
      </div>

      <p className="ml-[4rem] mt-3 font-inter text-base text-gray-700">
        {error.message}
      </p>

      <button
        role="link"
        type="button"
        onClick={() => router.reload()}
        className="ml-[4rem] mt-5 rounded-[10px] font-medium px-4 py-2.5 text-sm border bg-red-500/90 hover:bg-red-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-100 focus:ring-red-500 font-inter text-white"
      >
        Reload Page
      </button>
    </div>
  );
};

export default DisconnectedProviderAccount;
