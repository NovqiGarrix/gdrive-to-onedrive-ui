import axios from "axios";

import type { OnDownloadProgress } from "../types";
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';
import getPercentageUploadProgress from "./getPercentageUploadProgress";

interface IDownloadFileParams {
    downloadUrl: string;
    signal: AbortSignal;
    onDownloadProgress?: OnDownloadProgress;
}

export default async function downloadFile(params: IDownloadFileParams): Promise<ArrayBuffer> {

    const { downloadUrl, signal, onDownloadProgress } = params;

    const { data: fileBuffer,
        status: fileRespStatus,
        statusText: fileRespStatusText
    } = await axios.get(downloadUrl, {
        signal,
        responseType: 'arraybuffer',
        ...(typeof onDownloadProgress === "function" ? {
            onDownloadProgress(progressEvent) {
                onDownloadProgress(getPercentageUploadProgress(progressEvent.loaded, progressEvent.total!));
            }
        } : {}),
        validateStatus: () => true
    });

    if (fileRespStatus !== 200) {
        throw new HttpErrorExeption(fileRespStatus, `Error while downloading file: ${fileRespStatusText}`);
    }

    return fileBuffer;

}