import type {
    GetFilesReturn,
    GooglePhotosFilter,
    ITransferFileParams,
    IUploadFileParams
} from '../types';

import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';
import formatGooglePhotosFilter from '../utils/formatGooglePhotosFilter';
import getParentIdOrPathOfFolder from '../utils/getParentIdOrPathOfFolder';

import googlephotosClient from '../lib/googlephotos.client';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import { API_URL, CL_UPLOADER_API_URL, GetFileFunction, cancelGoogleUploadSession, completeGoogleUploadSession, createGoogleUploadSession, defaultOptions } from '.';

const getFile: GetFileFunction = async (fileId) => {

    try {

        const resp = await fetch(`${API_URL}/api/google/photos/files/${fileId}?fields=*`, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return toGlobalTypes(data, 'google_photos');

    } catch (error) {
        throw handleHttpError(error);
    }

}

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

async function transferFile(params: ITransferFileParams): Promise<string> {

    try {

        params.path = getParentIdOrPathOfFolder(params.path, params.providerTargetId);

        const abortController = new AbortController();
        const timeout = setTimeout(() => {
            abortController.abort();
        }, 5000);

        const resp = await fetch(`${CL_UPLOADER_API_URL}/googlephotos/files`, {
            ...defaultOptions,
            method: 'POST',
            body: JSON.stringify(params),
            signal: abortController.signal
        });

        const { errors, data } = await resp.json();
        if (!resp.ok) {
            if (errors[0].error) {
                throw new HttpErrorExeption(resp.status, errors[0].error);
            }
        }

        clearTimeout(timeout);
        return data._id;

    } catch (error: any) {
        if (error.message.includes('The user aborted a request.')) {
            throw new Error('No response. Please try again.');
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

        await completeGoogleUploadSession(sessionId, signal);

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
    transferFile, uploadFile,
    getFile
}