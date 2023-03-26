import axios from 'axios';

import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';
import getPercentageUploadProgress from '../utils/getPercentageUploadProgress';

import { UPLOAD_CHUNK_SIZE } from '../constants';
import onedriveClient from '../lib/onedrive.client';
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

interface ITransferFileParams {
    file: TranferFileSchema;
    signal: AbortSignal;
    onInfoChange: (info: string) => void;
    onUploadProgress: (progress: number) => void;
    onDownloadProgress: (progress: number) => void;
}

async function transferFile(params: ITransferFileParams): Promise<void> {

    const { file, signal, onUploadProgress, onDownloadProgress, onInfoChange } = params;

    /**
     * Provider Ids
     * 1. google_drive
     * 2. google_photos
     * 3. onedrive
     * 
     * API URL Formula
     * /api/{provider}/{product}/files
     * 
     * API URL Example
     * /api/google/drive/files
     * /api/google/photos/files
     * /api/microsoft/files
     */

    const [provider, product] = file.providerId.startsWith('google_') ? file.providerId.split('_') : [file.providerId, '']

    try {

        const downloadUrlResp = await fetch(`${API_URL}/api/${provider}${product ? `/${product}` : ''}/files/${file.id}/downloadUrl`, { ...defaultOptions, signal });

        const { errors: downloadUrlErrors, data: downloadUrlData } = await downloadUrlResp.json();
        if (!downloadUrlResp.ok) {
            throw new HttpErrorExeption(downloadUrlResp.status, downloadUrlErrors[0].error);
        }

        const { permissionId, downloadUrl } = downloadUrlData;

        onInfoChange('Downloading your file');
        const { data: fileBuffer,
            status: fileRespStatus,
            statusText: fileRespStatusText
        } = await axios.get(downloadUrl, {
            signal,
            responseType: 'arraybuffer',
            onDownloadProgress(progressEvent) {
                onDownloadProgress(getPercentageUploadProgress(progressEvent.loaded, progressEvent.total!));
            },
            validateStatus: () => true
        });

        if (fileRespStatus !== 200) {
            throw new HttpErrorExeption(fileRespStatus, `Error while downloading file: ${fileRespStatusText}`);
        }

        if (fileBuffer.byteLength >= UPLOAD_CHUNK_SIZE) {
            return transferLargeFile({ file, signal, permissionId, fileBuffer, onUploadProgress, onInfoChange });
        }

        // Register the session to get fresh access token
        onInfoChange('Creating upload session');
        const registerResp = await fetch(`${API_URL}/api/microsoft/files/uploadSession`, {
            ...defaultOptions,
            method: "POST",
            signal
        });

        const { errors, data: { sessionId, accessToken } } = await registerResp.json();
        if (!registerResp.ok) {
            throw new HttpErrorExeption(registerResp.status, errors[0].error);
        }

        onInfoChange('Uploading your file');
        await onedriveClient.uploadFile({
            accessToken,
            buffer: Buffer.from(fileBuffer),
            filename: file.name,
            onedrivePath: file.path,
            onUploadProgress
        });

        onInfoChange('Last touch');
        const completeResp = await fetch(`${API_URL}/api/microsoft/files/uploadSession/${sessionId}/complete`, {
            ...defaultOptions,
            method: "POST",
            body: JSON.stringify({
                permissionId,
                fileId: file.id,
                providerId: file.providerId
            }),
            signal
        });

        const { errors: completeErrors } = await completeResp.json();

        if (!completeResp.ok) {
            console.log(completeErrors);
            throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
        }

        onInfoChange('Done');

    } catch (error) {
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

interface ITransferLargeFileParams {
    signal: AbortSignal;
    permissionId: string;
    fileBuffer: ArrayBuffer;
    file: TranferFileSchema;
    onInfoChange: (info: string) => void;
    onUploadProgress: (progress: number) => void;
}

async function transferLargeFile(params: ITransferLargeFileParams): Promise<void> {

    const { signal, fileBuffer, permissionId, file, onUploadProgress, onInfoChange } = params;

    try {

        // Register the file to be transfered to the server
        onInfoChange('Creating upload session');
        const registerResp = await fetch(`${API_URL}/api/microsoft/files/uploadSession`, {
            ...defaultOptions,
            method: "POST",
            signal
        });

        const { errors, data: { sessionId, accessToken } } = await registerResp.json();
        if (!registerResp.ok) {
            throw new HttpErrorExeption(registerResp.status, errors[0].error);
        }

        onInfoChange('Uploading your file');
        await onedriveClient.uploadLargeFile({
            accessToken,
            buffer: Buffer.from(fileBuffer),
            filename: file.name,
            onedrivePath: file.path,
            onUploadProgress
        });

        onInfoChange('Last touch');
        const completeResp = await fetch(`${API_URL}/api/microsoft/files/uploadSession/${sessionId}/complete`, {
            ...defaultOptions,
            method: "POST",
            body: JSON.stringify({
                permissionId,
                fileId: file.id,
                providerId: file.providerId
            }),
            signal
        });

        const { errors: completeErrors } = await completeResp.json();

        if (!completeResp.ok) {
            console.log(completeErrors);
            throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
        }

        onInfoChange('Done');

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