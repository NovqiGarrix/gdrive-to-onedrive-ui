import type {
    GetFilesReturn,
    GlobalItemTypes,
    IDeleteFilesParam,
    ITransferFileParams,
    IUploadFileParams,
} from '../types';

import getFilename from '../utils/getFilename';
import toGlobalTypes from '../utils/toGlobalTypes';
import getFileBuffer from '../utils/getFileBuffer';
import handleHttpError from '../utils/handleHttpError';
import getParentIdFromPath from '../utils/getParentIdFromPath';

import { UPLOAD_CHUNK_SIZE } from '../constants';
import onedriveClient from '../lib/onedrive.client';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import type { IGetFoldersOnlyParams } from './types';
import { API_URL, cancelMicrosoftUploadSession, completeMicrosoftUploadSession, createMicorosftUploadSession, defaultOptions } from '.';

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
        urlInURL.searchParams.append('fields', 'id,name,webUrl,@microsoft.graph.downloadUrl,video,file,folder,createdDateTime');

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

        const files = data.files.map((file: any) => toGlobalTypes(file, 'onedrive'))

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

async function transferFile(params: ITransferFileParams): Promise<void> {

    const { file, signal, providerId, onUploadProgress, onDownloadProgress, path } = params;

    let _sessionId: string | undefined = undefined;

    try {

        const arrayBuffer = await getFileBuffer({
            signal,
            providerId,
            onDownloadProgress,
            mimeType: file.mimeType,
            downloadUrl: file.downloadUrl
        });

        const { sessionId, accessToken } = await createMicorosftUploadSession(signal);
        _sessionId = sessionId;

        const filename = getFilename(file.name, file.mimeType);

        if (arrayBuffer.byteLength > UPLOAD_CHUNK_SIZE) {
            await onedriveClient.uploadLargeFile({
                signal,
                filename,
                accessToken,
                onUploadProgress,
                buffer: Buffer.from(arrayBuffer),
                onedrivePath: cleanPathFromFolderId(path)
            });
        } else {
            await onedriveClient.uploadFile({
                signal,
                filename,
                accessToken,
                onUploadProgress,
                buffer: Buffer.from(arrayBuffer),
                onedrivePath: cleanPathFromFolderId(path)
            });
        }

        await completeMicrosoftUploadSession(sessionId, signal);

    } catch (error) {
        if (_sessionId) {
            await cancelMicrosoftUploadSession(_sessionId);
        }
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

async function uploadFile(params: IUploadFileParams): Promise<void> {

    const { file, signal, onUploadProgress, path } = params;

    let _sessionId: string | undefined = undefined;

    try {

        const arrayBuffer = await file.arrayBuffer();

        const { sessionId, accessToken } = await createMicorosftUploadSession(signal);
        _sessionId = sessionId;

        if (arrayBuffer.byteLength > UPLOAD_CHUNK_SIZE) {
            await onedriveClient.uploadLargeFile({
                accessToken,
                onUploadProgress,
                filename: file.name,
                buffer: Buffer.from(arrayBuffer),
                onedrivePath: cleanPathFromFolderId(path)
            });
        } else {
            await onedriveClient.uploadFile({
                signal,
                accessToken,
                onUploadProgress,
                filename: file.name,
                buffer: Buffer.from(arrayBuffer),
                onedrivePath: cleanPathFromFolderId(path)
            });
        }

        await completeMicrosoftUploadSession(sessionId, signal);

    } catch (error) {
        if (_sessionId) {
            await cancelMicrosoftUploadSession(_sessionId);
        }
        throw handleHttpError(error);
    }

}

async function createFolder(foldername: string, path?: string): Promise<GlobalItemTypes> {

    const parentId = getParentIdFromPath(path);

    try {

        const resp = await fetch(`${API_URL}/api/microsoft/folders`, {
            ...defaultOptions,
            method: "POST",
            body: JSON.stringify({ foldername, parentId })
        });

        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return toGlobalTypes(data, 'onedrive');

    } catch (error) {
        console.log(error);
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles,
    transferFile, deleteFiles,
    uploadFile, createFolder
}