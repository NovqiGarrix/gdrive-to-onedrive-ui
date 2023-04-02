import type { GetFilesReturn, IDeleteFilesParam, ITransferFileParams } from '../types';

import googledrive from '../lib/googledrive.client';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import toGlobalTypes from '../utils/toGlobalTypes';
import getFileBuffer from '../utils/getFileBuffer';
import handleHttpError from '../utils/handleHttpError';

import { API_URL, defaultOptions } from '.';
import type { IGetFoldersOnlyParams } from './types';

interface IGetFilesParams {
    path?: string;
    query?: string;
    foldersOnly?: boolean;
    nextPageToken?: string;
}

function getParentIdFromPath(path: string | undefined): string | undefined {
    return path?.split("/").pop()?.split("~")[1];
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
    urlInURL.searchParams.append('query', !query ? `mimeType != 'application/vnd.google-apps.folder' and ${getParentQuery(parentId)}` : `name contains '${query}' and mimeType != 'application/vnd.google-apps.folder'`);

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

    const { file, signal, providerId, onUploadProgress, onDownloadProgress } = params;

    let _sessionId: string | undefined = undefined;

    try {

        const { arrayBuffer, permissionId } = await getFileBuffer({
            file,
            signal,
            providerId,
            onDownloadProgress,
        });

        const registerResp = await fetch(`${API_URL}/api/google/files/uploadSessions`, {
            ...defaultOptions,
            method: "POST",
            signal
        });

        const registerRespData = await registerResp.json();
        if (!registerResp.ok) {
            throw new HttpErrorExeption(registerResp.status, registerRespData.errors[0].error);
        }

        const { sessionId, fileId } = registerRespData.data;
        const accessToken = fileId.split(':')[1];

        _sessionId = sessionId;

        await googledrive.uploadFile({
            signal,
            accessToken,
            arrayBuffer,
            onUploadProgress,
            filename: file.name,
        });

        const completeResp = await fetch(`${API_URL}/api/google/files/uploadSessions/${sessionId}/complete`, {
            ...defaultOptions,
            method: "PUT",
            body: JSON.stringify({
                providerId,
                permissionId,
                fileId: file.id,
            }),
            signal
        });

        const { errors: completeErrors } = await completeResp.json();

        if (!completeResp.ok) {
            throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
        }

    } catch (error) {
        if (_sessionId) {
            const cancelResp = await fetch(`${API_URL}/api/google/files/uploadSessions/${_sessionId}/cancel`, {
                ...defaultOptions,
                method: "PUT"
            });

            await cancelResp.body?.cancel();
        }
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles,
    deleteFiles, transferFile
}