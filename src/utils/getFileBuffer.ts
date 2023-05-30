import useUser from "../hooks/useUser";
import { NEXT_PUBLIC_INFILE_HELPER_URL } from "../constants";
import type { OnDownloadProgress, Provider } from "../types";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import downloadFile from "./downloadFile";
import createExportDownloadUrl from "./createExportDownloadUrl";

interface IGetFileBufferParams {
    downloadUrl: string;
    providerId: Provider;

    mimeType?: string;
    signal?: AbortSignal;
    onDownloadProgress?: OnDownloadProgress;
}

export default async function getFileBuffer(params: IGetFileBufferParams): Promise<ArrayBuffer> {

    const { signal, downloadUrl, providerId, mimeType, onDownloadProgress } = params;

    let arrayBuffer: ArrayBuffer;

    if (providerId === 'google_photos') {
        arrayBuffer = await downloadFile({
            signal,
            providerId,
            onDownloadProgress,

            /**
             * Using proxy server to download files from google photos
             * in order to avoid CORS error
             */
            downloadUrl: `${NEXT_PUBLIC_INFILE_HELPER_URL}/api/v1/serve?url=${downloadUrl}`,
        });
    } else if (providerId === 'google_drive') {
        const downloadUrlInURL = new URL(downloadUrl);
        const googleDownloadUrl = downloadUrlInURL.searchParams.get('url');
        if (!googleDownloadUrl) throw new HttpErrorExeption(400, 'Invalid downloadUrl for GDrive.');

        let downloadUlrInString = downloadUrlInURL.toString();

        /**
         * If the file is a Google Doc, Sheets, or Slides file,
         * we need to export them to a different format
         * in order to download them.
         */
        if (mimeType?.startsWith('application/vnd.google-apps')) {
            const uid = useUser.getState().user.id;
            if (!uid) {
                throw new HttpErrorExeption(400, 'You need to login first.');
            }

            downloadUlrInString = createExportDownloadUrl(mimeType, downloadUrl);
        }

        arrayBuffer = await downloadFile({
            signal,
            providerId,
            onDownloadProgress,
            downloadUrl: downloadUlrInString,
        });
    } else {
        arrayBuffer = await downloadFile({
            signal,
            providerId,
            downloadUrl: downloadUrl,
            onDownloadProgress,
        });
    }

    return arrayBuffer;

}