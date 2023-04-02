import type {
    Provider,
    GetFilesReturn,
    OnUploadProgress,
    GooglePhotosFilter,
    OnDownloadProgress,
    TransferFileSchema
} from '../types';

import toGlobalTypes from '../utils/toGlobalTypes';
import getFileBuffer from '../utils/getFileBuffer';
import handleHttpError from '../utils/handleHttpError';
import formatGooglePhotosFilter from '../utils/formatGooglePhotosFilter';

import googlephotosClient from '../lib/googlephotos.client';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import { API_URL, defaultOptions } from '.';

async function getFiles(nextPageToken?: string, filter?: GooglePhotosFilter): Promise<GetFilesReturn> {

    const urlInURL = new URL(`${API_URL}/api/google/photos/files`);
    urlInURL.searchParams.append('fields', '*');
    if (nextPageToken) {
        urlInURL.searchParams.append('next_token', nextPageToken);
    }

    if (filter) {
        Object.entries(formatGooglePhotosFilter(filter))
            .forEach(([key, value]) => {
                if (value) {
                    urlInURL.searchParams.append(key, value);
                }
            });
    }

    try {

        const resp = await fetch(urlInURL, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        const files = data.files.map((file: any) => toGlobalTypes(file, 'google_photos'));

        return {
            files,
            nextPageToken: data.nextPageToken
        }

    } catch (error) {
        throw handleHttpError(error);
    }

}

async function getMediaTypes(): Promise<Array<string>> {
    try {
        const resp = await fetch(`${API_URL}/api/google/photos/media_types`, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data;
    } catch (error) {
        throw handleHttpError(error);
    }
}

async function getContentCategories(): Promise<Array<string>> {
    try {
        const resp = await fetch(`${API_URL}/api/google/photos/content_categories`, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data;
    } catch (error) {
        throw handleHttpError(error);
    }
}

interface IUploadFileParams {
    signal: AbortSignal;
    providerId: Provider;
    file: TransferFileSchema;
    onUploadProgress: OnUploadProgress;
    onDownloadProgress: OnDownloadProgress;
}

async function transferFile(params: IUploadFileParams): Promise<void> {

    const { file, signal, providerId, onUploadProgress, onDownloadProgress } = params;

    let _sessionId: string | undefined = undefined;

    try {

        const { arrayBuffer, permissionId } = await getFileBuffer({
            file,
            signal,
            providerId,
            onDownloadProgress,
        });

        const registerResp = await fetch(`${API_URL}/api/google/uploadSessions`, {
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

        await googlephotosClient.uploadFile({
            signal,
            accessToken,
            onUploadProgress,
            filename: file.name,
            buffer: Buffer.from(arrayBuffer)
        });

        const completeResp = await fetch(`${API_URL}/api/google/uploadSessions/${sessionId}/complete`, {
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
            const cancelResp = await fetch(`${API_URL}/api/google/uploadSessions/${_sessionId}/cancel`, {
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
    getMediaTypes,
    getContentCategories,
    transferFile,
}