import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';

import { HttpErrorExeption } from '../exeptions/httpErrorExeption';
import type { GetFilesReturn, GlobalItemTypes, IDeleteFilesParam, TranferFileSchema } from '../types';

import { API_URL, defaultOptions } from '.';

interface IGetFilesParams {
    path?: string;
    query?: string;
    nextPageToken?: string;
}

async function getFiles(params: IGetFilesParams): Promise<GetFilesReturn> {

    const { path, query, nextPageToken } = params;

    try {

        const urlInURL = new URL(`${API_URL}/api/microsoft/files`);
        urlInURL.searchParams.append('fields', 'id,name,webUrl,@microsoft.graph.downloadUrl,folder,video,file');

        Object.entries({ query, path, next_token: nextPageToken }).forEach(([key, value]) => {
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
        console.log(error);
        throw handleHttpError(error);
    }

}

async function transferFile(file: TranferFileSchema): Promise<void> {

    try {

        const resp = await fetch(`${API_URL}/api/microsoft/files`, {
            ...defaultOptions,
            method: "POST",
            body: JSON.stringify({ name: file.name, downloadUrl: file.downloadUrl, path: file.path })
        });

        const { errors } = await resp.json();
        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

    } catch (error) {
        throw handleHttpError(error);
    }

}

async function deleteFile(files: Array<IDeleteFilesParam>): Promise<void> {

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

        if (resp.ok && errors) {
            throw new HttpErrorExeption(resp.status, JSON.stringify(errors));
        }

    } catch (error) {
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles,
    transferFile, deleteFile
}