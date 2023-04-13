import { FunctionComponent } from "react";

import Image from "next/image";
import { useRouter } from "next/router";

import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import authApi from "../apis/auth.api";
import type { AccountObject } from "../types";
import signInWithRedirectUrl from "../utils/signInWithRedirectUrl";

import useGetLinkedAccounts from "../hooks/useGetLinkedAccounts";
import useGetProviderAccountInfo from "../hooks/useGetProviderAccountInfo";

const LinkedAccounts: FunctionComponent = () => {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { queryKey: getProviderAccountInfoQueryKey } =
    useGetProviderAccountInfo();

  const {
    data: linkedAccounts,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetLinkedAccounts();

  async function connectOrDisconnect(account: AccountObject) {
    const TOAST_ID = "connectOrDisconnectAccount";

    try {
      switch (account.id) {
        case "microsoft": {
          if (account.isConnected) {
            toast.loading("Disconnecting from Microsoft...", {
              id: TOAST_ID,
            });

            await authApi.logoutFromMicrosoft();
            await queryClient.refetchQueries(getProviderAccountInfoQueryKey);

            toast.success("Disconnected from Microsoft.", { id: TOAST_ID });
            return;
          }

          // Get Microsoft login url
          const authURL = await authApi.getMicorosftAuthUrl();
          signInWithRedirectUrl(authURL);
          break;
        }

        case "google": {
          if (account.isConnected) {
            toast.loading(`Disconnecting from ${account.name}...`, {
              id: TOAST_ID,
            });

            await authApi.logoutFromGoogle();
            await queryClient.refetchQueries(getProviderAccountInfoQueryKey);

            toast.success(`Disconnected from ${account.name}.`, {
              id: TOAST_ID,
            });
            return;
          }

          // Get Google login url
          const authURL = await authApi.getGoogleAuthUrl();
          signInWithRedirectUrl(authURL);
          break;
        }

        default:
          toast.error("Invalid Account.");
      }
    } catch (error: any) {
      toast.error(error.message, { id: TOAST_ID });
    } finally {
      await refetch();
    }
  }

  return (
    <div className="pt-4 pb-5">
      <h3 className="font-bold text-base text-gray-600">Linked accounts</h3>
      <p className="text-sm text-gray-400">
        We use this to let you sign in and see all your files
      </p>

      {isLoading ? (
        <div className="flex space-y-4 mt-5 flex-col justify-between animate-pulse">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                  <div className="ml-4 rounded w-32 h-2 bg-gray-300"></div>
                </div>

                <div className="rounded-md cursor-pointer border border-gray-300 bg-white py-2 px-3 text-sm font-semibold text-gray-500 shadow-sm hover:bg-gray-50">
                  <div className="rounded w-10 h-2 bg-gray-300"></div>
                </div>
              </div>
            ))}
        </div>
      ) : isError ? (
        <div className="w-full mt-5">
          <p className="text-error text-sm">{error.message}</p>

          <button
            type="button"
            onClick={router.reload}
            className="mt-2 rounded-md cursor-pointer border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-500 shadow-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4 mt-5">
          {linkedAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="avatar">
                  <div className="w-7">
                    <Image
                      src={account.image}
                      alt={account.name}
                      width={500}
                      height={500}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>
                <span className="ml-4 block text-gray-500 text-sm">
                  Sign in with {account.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => connectOrDisconnect(account)}
                className="rounded-md cursor-pointer border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-500 shadow-sm hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {account.isConnected ? "Disconnected" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedAccounts;
