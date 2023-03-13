import type { GetFilesReturn } from '../types';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import toGlobalTypes from '../utils/toGlobalTypes';
import handleHttpError from '../utils/handleHttpError';

import { API_URL, defaultOptions } from '.';

async function getFiles(query?: string, nextPageToken?: string): Promise<GetFilesReturn> {

    try {
        const resp = await fetch(`${API_URL}/api/google/drive/files?query=${query || ''}&fields=*${nextPageToken ? `&next_token=${encodeURIComponent(nextPageToken)}` : ''}`, defaultOptions);
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