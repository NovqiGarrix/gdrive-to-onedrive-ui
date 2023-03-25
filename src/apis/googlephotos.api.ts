import { GetFilesReturn, GooglePhotosFilter } from '../types';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';
import formatGooglePhotosFilter from '../utils/formatGooglePhotosFilter';

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

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getFiles,
    getMediaTypes,
    getContentCategories
}