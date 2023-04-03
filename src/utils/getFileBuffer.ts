import { API_URL, defaultOptions } from "../apis";
import { NEXT_PUBLIC_INFILE_HELPER_URL } from "../constants";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";
import type { OnDownloadProgress, Provider, TransferFileSchema } from "../types";

import downloadFile from "./downloadFile";

interface IGetFileBufferParams {
    signal: AbortSignal;
    providerId: Provider;
    file: TransferFileSchema;
    onDownloadProgress?: OnDownloadProgress;
}

interface IGetFileBufferReturn {
    arrayBuffer: ArrayBuffer;
    permissionId?: string;
}

export default async function getFileBuffer(params: IGetFileBufferParams): Promise<IGetFileBufferReturn> {

    const { file, signal, providerId, onDownloadProgress } = params;

    let arrayBuffer: ArrayBuffer;
    let permissionId: string | undefined = undefined;

    if (providerId === 'google_drive') {
        const downloadUrlResp = await fetch(`${API_URL}/api/google/drive/files/${file.id}/downloadUrl`, defaultOptions);
        const { data, errors } = await downloadUrlResp.json();

        if (!downloadUrlResp.ok) {
            throw new HttpErrorExeption(downloadUrlResp.status, errors[0].error);
        }

        const { permissionId: pId, downloadUrl } = data;
        permissionId = pId;

        arrayBuffer = await downloadFile({
            signal,
            downloadUrl,
            onDownloadProgress,
        });
    } else if (providerId === 'google_photos') {
        arrayBuffer = await downloadFile({
            signal,
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
            downloadUrl: file.downloadUrl,
            onDownloadProgress,
        });
    }

    return {
        arrayBuffer,
        permissionId
    }

}