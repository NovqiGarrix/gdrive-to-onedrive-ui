import { NEXT_PUBLIC_INFILE_HELPER_URL } from "../constants";
import type { OnDownloadProgress, Provider, TransferFileSchema } from "../types";

import downloadFile from "./downloadFile";

interface IGetFileBufferParams {
    signal: AbortSignal;
    providerId: Provider;
    file: TransferFileSchema;
    onDownloadProgress?: OnDownloadProgress;
}

export default async function getFileBuffer(params: IGetFileBufferParams): Promise<ArrayBuffer> {

    const { file, signal, providerId, onDownloadProgress } = params;

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
            downloadUrl: `${NEXT_PUBLIC_INFILE_HELPER_URL}/api/v1/serve?url=${file.downloadUrl}`,
        });
    } else {
        arrayBuffer = await downloadFile({
            signal,
            providerId,
            downloadUrl: file.downloadUrl,
            onDownloadProgress,
        });
    }

    return arrayBuffer;

}