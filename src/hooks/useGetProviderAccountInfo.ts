import { useQuery } from "@tanstack/react-query";

import authApi from "../apis/auth.api";
import type { AccountObject } from "../types";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useCloudProvider from "./useCloudProvider";
import useProviderAccountLoginUrl from "./useProviderAccountLoginUrl";

export default function useGetProviderAccountInfo() {

    const setLoginUrl = useProviderAccountLoginUrl((s) => s.setUrl);
    const accountProviderId = useCloudProvider((s) => s.provider.accountId);

    const { data, isLoading, isError, error } = useQuery<
        AccountObject,
        HttpErrorExeption
    >({
        queryKey: ["accountInfo", accountProviderId],
        queryFn: () => authApi.getAccountInfo(accountProviderId),

        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: process.env.NODE_ENV === "production",

        async onSuccess(data) {
            if (data.isConnected) return;

            // If the account is not connected, then we need to get the login url
            switch (data.id) {
                case 'microsoft': {
                    const authUrl = await authApi.getMicorosftAuthUrl();
                    setLoginUrl(authUrl);
                    break;
                }

                case 'google': {
                    const authUrl = await authApi.getAuthURL();
                    setLoginUrl(authUrl);
                    break;
                }

                default:
                    break;
            }
        }
    });

    return {
        data,
        error,
        isError,
        isLoading,
    }

}