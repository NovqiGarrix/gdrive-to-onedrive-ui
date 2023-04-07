import { useCallback } from "react";
import type { GetFilesFuncParams } from "../types";

import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";
import googlephotosApi from "../apis/googlephotos.api";
import useCloudProvider from "./useCloudProvider";


function useGetFilesFunc(_providerId?: string) {

    const providerId = useCloudProvider((s) => _providerId || s.provider.id);

    const getFiles = useCallback(
        (params: GetFilesFuncParams) => {
            const { query, nextPageToken, path, filters, foldersOnly } = params;

            switch (providerId) {
                case "google_drive":
                    return googledriveApi.getFiles({
                        query,
                        nextPageToken,
                        foldersOnly,
                        path,
                    });

                case "google_photos":
                    return googlephotosApi.getFiles(nextPageToken, filters);

                case "onedrive":
                    return onedriveApi.getFiles({
                        query,
                        nextPageToken,
                        path,
                        foldersOnly,
                    });

                default:
                    throw new Error("Invalid Provider!");
            }
        },
        [providerId]
    );

    return getFiles;
}

export default useGetFilesFunc;