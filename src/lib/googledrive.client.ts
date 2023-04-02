import axios from 'axios';
import mime from 'mime-types';

import type { OnUploadProgress } from '../types';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import handleHttpError from '../utils/handleHttpError';
import getPercentageUploadProgress from '../utils/getPercentageUploadProgress';

interface IUploadFileParams {
    filename: string;
    accessToken: string;
    signal: AbortSignal;
    arrayBuffer: ArrayBuffer;
    onUploadProgress: OnUploadProgress;

    folderId?: string;
}

class GoogleDrive {

    private static instance: GoogleDrive;

    public static getInstance() {
        if (this.instance) return this.instance;

        this.instance = new GoogleDrive();
        return this.instance;
    }

    private constructor() {
        if (GoogleDrive.instance) throw new Error("Initialize the Class using GoogleDrive.getInstance()");
    }

    async uploadFile(params: IUploadFileParams) {
        const { filename, folderId, arrayBuffer, accessToken, onUploadProgress, signal } = params;

        const mimeType = mime.lookup(filename);
        if (!mimeType) {
            throw new HttpErrorExeption(400, 'Invalid file extension');
        }

        const contentType = mime.contentType(filename);
        if (!contentType) {
            throw new HttpErrorExeption(400, 'Invalid file extension');
        }

        const metadata = {
            mimeType,
            name: filename,
            parents: folderId ? [folderId] : []
        }

        try {

            // Create the multipart request body
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', new Blob([arrayBuffer], { type: contentType }));

            const urlInUrl = new URL('https://www.googleapis.com/upload/drive/v3/files');
            urlInUrl.searchParams.append('uploadType', 'multipart');
            urlInUrl.searchParams.append('fields', 'id,name,mimeType,thumbnailLink,webViewLink,imageMediaMetadata,iconLink,webContentLink');

            const { data, status, statusText } = await axios.post(urlInUrl.toString(), formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                signal,
                onUploadProgress(progressEvent) {
                    onUploadProgress(getPercentageUploadProgress(progressEvent.loaded, progressEvent.total!));
                },
            });

            if (status !== 200) {
                throw new HttpErrorExeption(status, statusText);
            }

            return data;
        } catch (error) {
            console.log(error);
            throw handleHttpError(error);
        }
    }

}

const googledrive = GoogleDrive.getInstance();
export default googledrive;