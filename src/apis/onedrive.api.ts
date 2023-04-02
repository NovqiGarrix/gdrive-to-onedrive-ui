import axios from 'axios';

import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';
import getPercentageUploadProgress from '../utils/getPercentageUploadProgress';

import { UPLOAD_CHUNK_SIZE } from '../constants';
import onedriveClient from '../lib/onedrive.client';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';
import type { GetFilesReturn, IDeleteFilesParam, ITransferFileParams, OnDownloadProgress, OnUploadProgress, Provider, TransferFileSchema } from '../types';

import { API_URL, defaultOptions } from '.';
import type { IGetFoldersOnlyParams } from './types';
import getFileBuffer from '../utils/getFileBuffer';


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

        if (arrayBuffer.byteLength > UPLOAD_CHUNK_SIZE) {
            return transferLargeFile({
                file,
                signal,
                providerId,
                permissionId,
                onUploadProgress,
                fileBuffer: arrayBuffer,
            })
        }

        const registerResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions`, {
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

        await onedriveClient.uploadFile({
            signal,
            accessToken,
            onUploadProgress,
            filename: file.name,
            buffer: Buffer.from(arrayBuffer)
        });

        const completeResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions/${sessionId}/complete`, {
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
            console.log(completeErrors);
            throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
        }

    } catch (error) {
        if (_sessionId) {
            const cancelResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions/${_sessionId}/cancel`, {
                ...defaultOptions,
                method: "PUT"
            });

            await cancelResp.body?.cancel();
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

interface ITransferLargeFileParams {
    signal: AbortSignal;
    providerId: Provider;
    permissionId?: string;
    fileBuffer: ArrayBuffer;
    file: TransferFileSchema;
    onUploadProgress: OnUploadProgress;
}

async function transferLargeFile(params: ITransferLargeFileParams): Promise<void> {

    const { signal, fileBuffer, permissionId, file, onUploadProgress, providerId } = params;

    let _sessionId: string | undefined = undefined;

    try {

        // Register the file to be transfered to the server
        const registerResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions`, {
            ...defaultOptions,
            method: "POST",
            signal
        });

        const { errors, data: { sessionId, fileId } } = await registerResp.json();
        if (!registerResp.ok) {
            throw new HttpErrorExeption(registerResp.status, errors[0].error);
        }

        const accessToken = fileId.split(':')[1];

        _sessionId = sessionId;

        await onedriveClient.uploadLargeFile({
            accessToken,
            buffer: Buffer.from(fileBuffer),
            filename: file.name,
            onedrivePath: file.path,
            onUploadProgress
        });

        const completeResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions/${sessionId}/complete`, {
            ...defaultOptions,
            method: "PUT",
            body: JSON.stringify({
                permissionId,
                fileId: file.id,
                providerId,
            }),
            signal
        });

        const { errors: completeErrors } = await completeResp.json();

        if (!completeResp.ok) {
            console.log(completeErrors);
            throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
        }

    } catch (error) {
        if (_sessionId) {
            const cancelResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions/${_sessionId}/cancel`, {
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
    transferFile, deleteFiles
}