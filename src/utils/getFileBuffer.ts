import { NEXT_PUBLIC_INFILE_HELPER_URL } from "../constants";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";
import type { OnDownloadProgress, Provider } from "../types";

import downloadFile from "./downloadFile";

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
            downloadUlrInString = `/api/google/export?url=${encodeURIComponent(googleDownloadUrl)}&mimeType=${encodeURIComponent(mimeType)}`;
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