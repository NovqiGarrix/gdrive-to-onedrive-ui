import { CL_UPLOADER_API_URL, defaultOptions } from ".";

import type { TransferSession } from "../types";
import handleHttpError from "../utils/handleHttpError";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";


async function getUnfinished(): Promise<Array<TransferSession>> {

    console.log('getUnfinishedTransferSession');

    const urlInURL = new URL(`${CL_UPLOADER_API_URL}/transfer_sessions`);
    urlInURL.searchParams.set('filter', JSON.stringify({ status: 'in_progress' }));

    try {
        const resp = await fetch(urlInURL, defaultOptions);

        const { errors, data } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data;
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function getProgress(transferSession: Array<TransferSession>): Promise<Array<TransferSession & { error?: string }>> {

    try {

        const transferSessions = await Promise.all(
            transferSession.map(async (ts) => {
                try {
                    const urlInURL = `${CL_UPLOADER_API_URL}/transfer_sessions/${ts._id}?fields=progress,fileId,status`;
                    const resp = await fetch(urlInURL, defaultOptions);

                    const { errors, data } = await resp.json();

                    if (!resp.ok) {
                        return { error: errors[0].error }
                    }

                    return data;
                } catch (error) {
                    return undefined;
                }
            })
        );

        console.log(transferSessions);

        return transferSessions;

    } catch (error) {
        throw handleHttpError(error);
    }

}



// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getUnfinished, getProgress
}