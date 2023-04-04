import axios from "axios";

import type { OnDownloadProgress, Provider } from "../types";
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';
import getPercentageUploadProgress from "./getPercentageUploadProgress";

interface IDownloadFileParams {
    downloadUrl: string;
    signal: AbortSignal;
    providerId: Provider;
    onDownloadProgress?: OnDownloadProgress;
}

export default async function downloadFile(params: IDownloadFileParams): Promise<ArrayBuffer> {

    const { downloadUrl, signal, providerId, onDownloadProgress } = params;

    const { data: fileBuffer,
        status: fileRespStatus,
        statusText: fileRespStatusText
    } = await axios.get(downloadUrl, {
        signal,
        ...(providerId === 'google_drive' ? () => {

            /**
             * For Google Drive
             * We can't just use downloadUrl as it is,
             * because google wont allow us to download file without access token
             * 
             * So, in the server side we get downloadUrl from google drive api
             * and then we add access token to it (as qat in query param)
             */

            const downloadUrlInURL = new URL(downloadUrl);
            const accessToken = downloadUrlInURL.searchParams.get('qat');

            return {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        } : {}),
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