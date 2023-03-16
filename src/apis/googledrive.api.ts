import type { GetFilesReturn } from '../types';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';

import { API_URL, defaultOptions } from '.';
import { IGetFoldersOnlyParams } from './types';

interface IGetFilesParams {
    path?: string;
    query?: string;
    foldersOnly?: boolean;
    nextPageToken?: string;
}

async function getFiles(params: IGetFilesParams): Promise<GetFilesReturn> {

    const { query, foldersOnly, nextPageToken, path } = params;
    if (foldersOnly) return getFoldersOnly(params);

    const parentId = path ? await getFileIdFromPath(path) : undefined;

    const urlInURL = new URL(`${API_URL}/api/google/drive/files`);

    urlInURL.searchParams.append('fields', '*');
    urlInURL.searchParams.append('query', !query ? `mimeType != 'application/vnd.google-apps.folder'` : `name contains '${query}' and mimeType != 'application/vnd.google-apps.folder'`);

    Object.entries({ next_token: nextPageToken, parent_id: parentId }).forEach(([key, value]) => {
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

async function getFileIdFromPath(path: string): Promise<string | undefined> {

    const foldername = path.split('/').pop();
    if (!foldername) return undefined;

    const urlInURL = new URL(`${API_URL}/api/google/drive/files`);
    urlInURL.searchParams.append('fields', 'id');
    urlInURL.searchParams.append('query', `name = '${foldername}'`);

    try {

        const resp = await fetch(urlInURL, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data.files.at(0)?.id;

    } catch (error) {
        throw handleHttpError(error);
    }

}

async function getFoldersOnly(params: IGetFoldersOnlyParams): Promise<GetFilesReturn> {

    const { nextPageToken, path, query } = params;

    const urlInURL = new URL(`${API_URL}/api/google/drive/files`);

    urlInURL.searchParams.append('fields', '*');


    try {

        const parentId = path ? await getFileIdFromPath(path) : undefined;
        urlInURL.searchParams.append('query',
            !query
                ? `mimeType = 'application/vnd.google-apps.folder' ${parentId ? '' : `and 'root' in parents`}`
                : `name contains '${query}' and mimeType = 'application/vnd.google-apps.folder' ${parentId ? '' : `and 'root' in parents`}`);

        Object.entries({ next_token: nextPageToken, path, query, parent_id: parentId }).forEach(([key, value]) => {
            if (value) {
                urlInURL.searchParams.append(key, value);
            }
        });
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

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles
}