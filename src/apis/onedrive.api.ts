import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';

import { UPLOAD_CHUNK_SIZE } from '../constants';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';
import type { GetFilesReturn, IDeleteFilesParam, TranferFileSchema } from '../types';

import { API_URL, defaultOptions } from '.';
import type { IGetFoldersOnlyParams } from './types';

interface IGetFilesParams {
    path?: string;
    query?: string;
    foldersOnly?: boolean;
    nextPageToken?: string;
}

function cleanPathFromFolderId(path: string | undefined): string | undefined {
    return path?.split("/").map((p) => p.split("~")[0]).join("/");
}

async function getFiles(params: IGetFilesParams): Promise<GetFilesReturn> {

    const { path, query, nextPageToken, foldersOnly } = params;

    if (foldersOnly) return getFoldersOnly({ nextPageToken, path, query });

    try {

        const urlInURL = new URL(`${API_URL}/api/microsoft/files`);
        urlInURL.searchParams.append('fields', 'id,name,webUrl,@microsoft.graph.downloadUrl,video,file,folder');

        Object.entries({ query, path: cleanPathFromFolderId(path), next_token: nextPageToken }).forEach(([key, value]) => {
            if (value) {
                urlInURL.searchParams.append(key, value);
            }
        });

        const resp = await fetch(urlInURL, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        const files = data.files.map((file: any) => toGlobalTypes(file, 'onedrive'));

        return {
            files,
            nextPageToken: data.nextPageToken
        }
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function getFoldersOnly(params: IGetFoldersOnlyParams): Promise<GetFilesReturn> {

    const { path, nextPageToken, query } = params;

    try {

        const urlInURL = new URL(`${API_URL}/api/microsoft/files`);

        urlInURL.searchParams.append('filter', 'folder ne null');
        urlInURL.searchParams.append('fields', 'id,name,webUrl,folder');

        Object.entries({ next_token: nextPageToken, path: cleanPathFromFolderId(path), query }).forEach(([key, value]) => {
            if (value) {
                urlInURL.searchParams.append(key, value);
            }
        });

        const resp = await fetch(urlInURL, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        const files = data.files.map((file: any) => toGlobalTypes(file, 'onedrive'));

        return {
            files,
            nextPageToken: data.nextPageToken
        }
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function transferFile(file: TranferFileSchema, signal: AbortSignal): Promise<void> {

    /**
         * Provider Ids
         * 1. google_drive
         * 2. google_photos
         * 3. onedrive
         */

    // API URL Formula
    // /api/{provider}/{product}/files

    // API URL Example
    // /api/google/drive/files
    // /api/google/photos/files

    // /api/microsoft/files

    const [provider, product] = file.providerId.startsWith('google_') ? file.providerId.split('_') : [file.providerId, '']

    try {

        const respFile = await fetch(`${API_URL}/api/${provider}${product ? `/${product}` : ''}/files/${file.id}/buffers`, { credentials: 'include', signal });
        if (!respFile.ok) {
            throw new HttpErrorExeption(respFile.status, `Error tranferring the file: ${respFile.statusText}`);
        }

        const contentType = respFile.headers.get('content-type');
        if (contentType?.includes("application/json")) {
            const { errors } = await respFile.json();
            throw new HttpErrorExeption(respFile.status, errors[0].error);
        }

        const fileArrayBuffer = await respFile.arrayBuffer();
        if (fileArrayBuffer.byteLength >= UPLOAD_CHUNK_SIZE) {
            return transferLargeFile(file, signal, fileArrayBuffer);
        }

        const resp = await fetch(`${API_URL}/api/microsoft/files`, {
            ...defaultOptions,
            method: "POST",
            body: JSON.stringify({ name: file.name, downloadUrl: file.downloadUrl, path: file.path }),
            signal
        });

        const { errors } = await resp.json();
        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

    } catch (error) {
        console.log(error);
        throw handleHttpError(error);
    }

}

async function deleteFiles(files: Array<IDeleteFilesParam>): Promise<void> {

    try {

        const resp = await fetch(`${API_URL}/api/microsoft/files?files=${encodeURIComponent(JSON.stringify(files))}`, {
            ...defaultOptions,
            method: "DELETE"
        });

        const { errors } = await resp.json();
        if (!resp.ok) {
            if (errors[0].error) {
                throw new HttpErrorExeption(resp.status, errors[0].error);
            }
        }

        // If the response status is 200,
        // but there are errors, it means that some files were not deleted
        if (resp.ok && errors) {
            throw new HttpErrorExeption(resp.status, JSON.stringify(errors));
        }

    } catch (error) {
        throw handleHttpError(error);
    }

}

async function transferLargeFile(file: TranferFileSchema, signal: AbortSignal, fileArrayBuffer: ArrayBuffer): Promise<void> {

    try {

        // Register the file to be transfered to the server
        const registerResp = await fetch(`${API_URL}/api/microsoft/files/uploadSession`, {
            ...defaultOptions,
            method: "POST",
            signal
        });

        const { errors, data: sessionId } = await registerResp.json();
        if (!registerResp.ok) {
            throw new HttpErrorExeption(registerResp.status, errors[0].error);
        }

        let startChunk = 0;
        let endChunk = UPLOAD_CHUNK_SIZE;

        const totalSize = fileArrayBuffer.byteLength;

        while (startChunk < endChunk) {
            endChunk = Math.min(endChunk, totalSize);
            const chunk = fileArrayBuffer.slice(startChunk, endChunk);

            const respUpload = await fetch(`${API_URL}/api/microsoft/files/uploadSession/${sessionId}/chunks`, {
                headers: {
                    "Content-Type": "application/octet-stream"
                },
                credentials: 'include',
                method: "POST",
                body: chunk,
                signal
            });

            const { errors: uploadErrors } = await respUpload.json();
            if (!respUpload.ok) {
                throw new HttpErrorExeption(respUpload.status, uploadErrors[0].error);
            }

            startChunk += UPLOAD_CHUNK_SIZE;
            endChunk += UPLOAD_CHUNK_SIZE;
        }

        const completeResp = await fetch(`${API_URL}/api/microsoft/files/uploadSession/${sessionId}/complete`, {
            ...defaultOptions,
            method: "POST",
            body: JSON.stringify({
                path: file.path,
                name: file.name,
            }),
            signal
        });

        const { errors: completeErrors } = await completeResp.json();

        if (!completeResp.ok) {
            console.log(completeErrors);
            throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
        }

    } catch (error) {
        console.log(error);
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles,
    transferFile, deleteFiles
}