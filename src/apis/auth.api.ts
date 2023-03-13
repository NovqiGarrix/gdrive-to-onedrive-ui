import { User } from "../types";
import { ERROR_500_MESSAGE } from "../constants";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import { API_URL, defaultOptions } from ".";
import handleHttpError from "../utils/handleHttpError";

const fetchOptions = (cookie: string): RequestInit => ({
    ...defaultOptions,
    headers: {
        ...defaultOptions.headers,
        Cookie: cookie
    },
    credentials: 'include'
});

async function getAuthURL(): Promise<string> {

    try {
        const resp = await fetch(`${API_URL}/api/google/auth/url`, defaultOptions);
        const { data } = await resp.json();

        return data;
    } catch (error) {
        throw new HttpErrorExeption(500, ERROR_500_MESSAGE);
    }

}

async function getMe(token?: string): Promise<User | undefined> {

    try {
        const resp = await fetch(`${API_URL}/api/me`, fetchOptions(`qid=${token}`));
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            if (resp.status === 401) {
                return undefined;
            }

            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data;
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function logout(token?: string): Promise<void> {

    try {
        const resp = await fetch(`${API_URL}/api/me/logout`, {
            ...fetchOptions(`qid=${token}`),
            method: 'DELETE'
        });

        const { errors } = await resp.json();
        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function getMicorosftAuthUrl(): Promise<string> {

    try {
        const resp = await fetch(`${API_URL}/api/microsoft/auth/url`, defaultOptions);
        const { data, errors } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data;
    } catch (error) {
        throw handleHttpError(error);
    }

}

async function logoutFromMicrosoft(): Promise<void> {

    try {
        const resp = await fetch(`${API_URL}/api/microsoft/auth/logout`, {
            ...defaultOptions,
            method: 'DELETE'
        });

        const { errors } = await resp.json();
        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }
    } catch (error) {
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getAuthURL,
    getMe, logout,
    getMicorosftAuthUrl,
    logoutFromMicrosoft,
}