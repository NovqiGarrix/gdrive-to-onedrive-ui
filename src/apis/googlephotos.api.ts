import type {
    GetFilesReturn,
    GooglePhotosFilter,
    ITransferFileParams,
    IUploadFileParams
} from '../types';

import toGlobalTypes from '../utils/toGlobalTypes';
import getFileBuffer from '../utils/getFileBuffer';
import handleHttpError from '../utils/handleHttpError';
import formatGooglePhotosFilter from '../utils/formatGooglePhotosFilter';

import googlephotosClient from '../lib/googlephotos.client';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import { API_URL, cancelGoogleUploadSession, createGoogleUploadSession, defaultOptions } from '.';

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

        const files = data.files.map((file: any) => toGlobalTypes(file, 'google_photos'))

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

async function transferFile(params: ITransferFileParams): Promise<void> {

    const { file, signal, providerId, onUploadProgress, onDownloadProgress } = params;

    let _sessionId: string | undefined = undefined;

    try {

        const arrayBuffer = await getFileBuffer({
            signal,
            providerId,
            onDownloadProgress,
            downloadUrl: file.downloadUrl
        });

        googlephotosClient.validateFile(file.name, arrayBuffer.byteLength);

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

        await googlephotosClient.uploadFile({
            signal,
            accessToken,
            onUploadProgress,
            filename: file.name,
            buffer: Buffer.from(arrayBuffer)
        });

        const completeResp = await fetch(`${API_URL}/api/google/files/uploadSessions/${sessionId}/complete`, {
            ...defaultOptions,
            signal,
            method: "PUT"
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

async function uploadFile(params: IUploadFileParams): Promise<void> {

    const { file, signal, onUploadProgress } = params;

    let _sessionId: string | undefined = undefined;

    try {

        const arrayBuffer = await file.arrayBuffer();

        const { sessionId, accessToken } = await createGoogleUploadSession(signal);
        _sessionId = sessionId;

        await googlephotosClient.uploadFile({
            signal,
            accessToken,
            onUploadProgress,
            filename: file.name,
            buffer: Buffer.from(arrayBuffer)
        });

        const completeResp = await fetch(`${API_URL}/api/google/files/uploadSessions/${sessionId}/complete`, {
            ...defaultOptions,
            signal,
            method: "PUT"
        });

        const { errors: completeErrors } = await completeResp.json();

        if (!completeResp.ok) {
            throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
        }

    } catch (error) {
        if (_sessionId) {
            await cancelGoogleUploadSession(_sessionId);
        }
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles,
    getMediaTypes,
    getContentCategories,
    transferFile, uploadFile
}