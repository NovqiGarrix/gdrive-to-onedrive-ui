import { useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";

import useGetFilesFunc from "../components/useGetFilesFunc";
import type { GetFilesReturn, ProviderObject } from "../types";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useSearchQuery from "./useSearchQuery";
import useProviderPath from "./useProviderPath";
import useCloudProvider from "./useCloudProvider";
import useGooglePhotosFilter from "./useGooglePhotosFilter";

function useGetFiles() {

    const getFiles = useGetFilesFunc();

    const [data, setData] = useState<GetFilesReturn>({
        files: [],
        nextPageToken: undefined,
    });

    const providerPath = useProviderPath((s) => s.path);
    const provider = useCloudProvider((s) => s.provider, shallow);
    const debounceQuery = useSearchQuery((s) => s.debounceQuery);

    const previousProvider = useRef<ProviderObject>(provider);
    const googlePhotosFilters = useGooglePhotosFilter((s) => s.formattedFilters, shallow);

    const queryKey = useMemo(() => {
        return [
            "files",
            provider.id,
            debounceQuery,
            providerPath,
            provider.id === "google_photos"
                ? JSON.stringify(googlePhotosFilters)
                : undefined,
        ].filter(Boolean);
    }, [debounceQuery, googlePhotosFilters, provider.id, providerPath]);

    const { isLoading, isError, error, isFetching } = useQuery<
        GetFilesReturn,
        HttpErrorExeption
    >({
        queryFn: () =>
            getFiles({
                query: debounceQuery,
                path: providerPath,
                filters: googlePhotosFilters,
            }),
        queryKey,
        retry: false,
        keepPreviousData: true,
        refetchOnWindowFocus: process.env.NODE_ENV === "production",

        behavior: {
            onFetch() {
                if (provider.id !== previousProvider.current.id) {
                    toast.loading(`Switching to ${provider.name}...`, {
                        id: "switching-provider",
                    });
                }
            },
        },

        onSuccess(data) {
            setData(data);
            if (provider.id !== previousProvider.current.id) {
                previousProvider.current = provider;
                toast.success(`Switched to ${provider.name}`, {
                    id: "switching-provider",
                });
            }
        },

        async onError(err) {
            // Already handled in the home page with useGetProviderAccountInfo
            if (err.message === "Unauthorized") return;

            toast.error(err.message, { id: "switching-provider" });
        },
    });

    return {
        data,
        setData,
        queryKey,

        error,
        isError,
        isLoading,
        isFetching,
    }

}

export default useGetFiles;