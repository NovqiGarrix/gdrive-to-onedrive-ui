import type {
    GetFilesReturn,
    IDeleteFilesParam,
    ITransferFileParams,
    IUploadFileParams
} from '../types';

import googledrive from '../lib/googledrive.client';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import toGlobalTypes from '../utils/toGlobalTypes';
import getFileBuffer from '../utils/getFileBuffer';
import handleHttpError from '../utils/handleHttpError';
import getParentIdFromPath from '../utils/getParentIdFromPath';

import {
    API_URL,
    cancelGoogleUploadSession,
    completeGoogleUploadSession,
    createGoogleUploadSession,
    defaultOptions
} from '.';
import type { GlobalItemTypes } from '../types';
import type { IGetFoldersOnlyParams } from './types';

interface IGetFilesParams {
    path?: string;
    query?: string;
    foldersOnly?: boolean;
    nextPageToken?: string;
}

function getParentQuery(parentId: string | undefined, foldersOnly?: boolean): string {
    if (foldersOnly) {
        return parentId
            ? `'${parentId}' in parents`
            : `('root' in parents or sharedWithMe = true)`
    }

    return parentId
        ? `'${parentId}' in parents`
        : `'root' in parents or sharedWithMe = true`
}

async function getFiles(params: IGetFilesParams): Promise<GetFilesReturn> {

    const { query, foldersOnly, nextPageToken, path } = params;
    if (foldersOnly) return getFoldersOnly(params);

    const parentId = getParentIdFromPath(path);

    const urlInURL = new URL(`${API_URL}/api/google/drive/files`);

    urlInURL.searchParams.append('fields', '*');
    urlInURL.searchParams.append('query', `mimeType != 'application/vnd.google-apps.folder' and ${!query ? `(${getParentQuery(parentId, false)})` : `name contains '${query}'`}`);

    Object.entries({ next_token: nextPageToken }).forEach(([key, value]) => {
        if (value) {
            urlInURL.searchParams.append(key, value);
        }
    });

    try {

        const resp = await fetch(urlInURL, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        const files = data.files.map((file: any) => toGlobalTypes(file, 'google_drive'));

        return {
            files,
            nextPageToken: data.nextPageToken
        }
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function getFoldersOnly(params: IGetFoldersOnlyParams): Promise<GetFilesReturn> {

    const { nextPageToken, path, query } = params;

    const parentId = getParentIdFromPath(path);
    const urlInURL = new URL(`${API_URL}/api/google/drive/files`);

    urlInURL.searchParams.append('fields', '*');

    const parentQuery = getParentQuery(parentId, true);

    urlInURL.searchParams.append('query',
        !query
            ? `mimeType = 'application/vnd.google-apps.folder' and ${parentQuery}`
            : `name contains '${query}' and mimeType = 'application/vnd.google-apps.folder'`);

    Object.entries({ next_token: nextPageToken, path, query, parent_id: parentId }).forEach(([key, value]) => {
        if (value) {
            urlInURL.searchParams.append(key, value);
        }
    });

    try {

        const resp = await fetch(urlInURL, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        const files = data.files.map((file: any) => toGlobalTypes(file, 'google_drive'));

        return {
            files,
            nextPageToken: data.nextPageToken
        }
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function deleteFiles(files: Array<IDeleteFilesParam>): Promise<void> {

    try {

        const resp = await fetch(`${API_URL}/api/google/drive/files?files=${encodeURIComponent(JSON.stringify(files))}`, {
            ...defaultOptions,
            method: "DELETE"
        });

        const { errors } = await resp.json();
        if (!resp.ok) {
            if (errors[0].error) {
                throw new HttpErrorExeption(resp.status, errors[0].error);
            }
        }

        if (resp.ok && errors) {
            throw new HttpErrorExeption(resp.status, JSON.stringify(errors));
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
            downloadUrl: file.downloadUrl
        });

        const { sessionId, accessToken } = await createGoogleUploadSession(signal);
        _sessionId = sessionId;

        await googledrive.uploadFile({
            signal,
            accessToken,
            arrayBuffer,
            onUploadProgress,
            filename: file.name,

            folderId: getParentIdFromPath(path)
        });

        await completeGoogleUploadSession(sessionId, signal);

    } catch (error) {
        if (_sessionId) {
            await cancelGoogleUploadSession(_sessionId);
        }
        throw handleHttpError(error);
    }

}

async function uploadFile(params: IUploadFileParams): Promise<void> {

    const { file, signal, path, onUploadProgress } = params;

    let _sessionId: string | undefined = undefined;

    try {

        const arrayBuffer = await file.arrayBuffer();

        const { sessionId, accessToken } = await createGoogleUploadSession(signal);
        _sessionId = sessionId;

        const folderId = getParentIdFromPath(path);

        await googledrive.uploadFile({
            signal,
            folderId,
            accessToken,
            arrayBuffer,
            onUploadProgress,
            filename: file.name,
        });

        await completeGoogleUploadSession(sessionId, signal);

    } catch (error) {
        if (_sessionId) {
            await cancelGoogleUploadSession(_sessionId);
        }
        throw handleHttpError(error);
    }

}

async function createFolder(foldername: string, path?: string): Promise<GlobalItemTypes> {

    const parentId = getParentIdFromPath(path);

    try {

        const resp = await fetch(`${API_URL}/api/google/drive/folders`, {
            ...defaultOptions,
            method: "POST",
            body: JSON.stringify({ foldername, parentId })
        });

        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return toGlobalTypes(data, 'google_drive');

    } catch (error) {
        throw handleHttpError(error);
    }

}

async function deleteFolder(folderId: string): Promise<void> {

    try {

        const resp = await fetch(`${API_URL}/api/google/drive/folders/${folderId}`, {
            ...defaultOptions,
            method: "DELETE"
        });

        const { errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

    } catch (error) {
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles,
    deleteFiles, transferFile,
    uploadFile, createFolder, deleteFolder
}