import { API_URL, defaultOptions } from ".";
import type { UserSettings } from "../types";

import handleHttpError from "../utils/handleHttpError";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

async function getSettings(uid: string, fields?: string, qid?: string): Promise<UserSettings> {

    try {

        const resp = await fetch(`${API_URL}/api/users/${uid}?fields=${fields || "googledriveSettings,transferSettings"}&include={"googledriveSettings": true, "transferSettings": true}`, {
            ...defaultOptions,
            headers: {
                ...defaultOptions.headers,
                ...(qid ? { Cookie: `qid=${qid}` } : {})
            }
        });

        const { errors, data } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data;

    } catch (error) {
        throw handleHttpError(error);
    }

}

interface UpdateGdriveSettingsParams {
    drawing?: string;
    document?: string;
    spreadsheet?: string;
    presentation?: string;
    script?: string;
}

async function updateGdriveSettings(data: UpdateGdriveSettingsParams): Promise<void> {

    try {

        const resp = await fetch(`${API_URL}/api/me/settings/googledrive`, {
            ...defaultOptions,
            method: 'PUT',
            body: JSON.stringify(data)
        });

        const { errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, JSON.stringify(errors));
        }

    } catch (error) {
        throw handleHttpError(error);
    }

}

interface UpdateTransferSettingsParams {
    moveFile?: boolean;
    moveDelay?: number;
    moveDelayKind?: string;
    enableMoveDelay?: boolean;
}

async function updateTransferSettings(data: UpdateTransferSettingsParams): Promise<void> {

    try {

        const resp = await fetch(`${API_URL}/api/me/settings/transfer`, {
            ...defaultOptions,
            method: 'PUT',
            body: JSON.stringify(data)
        });

        const { errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, JSON.stringify(errors));
        }

    } catch (error) {
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getSettings,
    updateGdriveSettings, updateTransferSettings
}