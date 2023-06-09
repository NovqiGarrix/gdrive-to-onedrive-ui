import axios from 'axios';

import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import { OneDriveItem } from '../types';
import getPercentageUploadProgress from '../utils/getPercentageUploadProgress';

interface IUploadFileFromBufferParams {
    buffer: Buffer;
    filename: string;
    accessToken: string;
    signal?: AbortSignal;
    onedrivePath?: string;
    onUploadProgress?: (progress: number) => void;
}

class OneDrive {

    private static instance: OneDrive;

    private baseUrl: string = 'https://graph.microsoft.com/v1.0';
    private defaultOptions = (accessToken: string): RequestInit => ({
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    })

    private constructor() {
        if (OneDrive.instance) throw new Error("Initialize the Class using OneDrive.getInstance()");
    }

    public static getInstance() {
        if (this.instance) return this.instance;

        this.instance = new OneDrive();
        return this.instance;
    }

    async uploadLargeFile(params: IUploadFileFromBufferParams): Promise<OneDriveItem> {

        const { buffer, filename, accessToken, onedrivePath, onUploadProgress, signal } = params;

        const totalSize = buffer.byteLength;

        const options = {
            name: filename,
            fileSize: totalSize,
            '@microsoft.graph.conflictBehavior': 'rename',
        }

        const endpoint = onedrivePath ? `/me/drive/root:/${onedrivePath}/${filename}:/createUploadSession` : `/me/drive/root:/${filename}:/createUploadSession`;

        const respOfUploadSession = await fetch(`${this.baseUrl}${endpoint}`, {
            ...this.defaultOptions(accessToken),
            signal,
            method: "POST",
            body: JSON.stringify(options)
        });

        const { uploadUrl, error } = await respOfUploadSession.json();

        if (!respOfUploadSession.ok) {
            if (respOfUploadSession.status === 507) {
                throw new HttpErrorExeption(respOfUploadSession.status, "You do not have enough space to upload this file.");
            }

            throw new HttpErrorExeption(respOfUploadSession.status, error.message);
        }

        const chunkSize = 1024 * 1024 * 2;

        let startChunk = 0;
        let endChunk = chunkSize;

        if (typeof onUploadProgress === 'function') {
            onUploadProgress(getPercentageUploadProgress(startChunk, totalSize));
        }

        let data: any;

        while (startChunk < totalSize) {
            endChunk = Math.min(endChunk, totalSize);
            const chunkBuffer = buffer.slice(startChunk, endChunk);

            const respUpload = await fetch(uploadUrl, {
                headers: {
                    "Content-Length": chunkBuffer.byteLength.toString(),
                    "Content-Range": `bytes ${startChunk}-${endChunk - 1}/${totalSize}`,
                },
                signal,
                method: "PUT",
                body: chunkBuffer
            });

            data = await respUpload.json();

            startChunk += chunkSize;
            endChunk += chunkSize;

            if (typeof onUploadProgress === 'function') {
                onUploadProgress(getPercentageUploadProgress(startChunk, totalSize));
                if (startChunk >= totalSize) {
                    onUploadProgress(100);
                }
            }
        }

        return data;

    }

    async uploadFile(params: IUploadFileFromBufferParams): Promise<OneDriveItem> {

        const { buffer, filename, accessToken, onedrivePath, onUploadProgress, signal } = params;

        let apiUrl: string;

        if (onedrivePath) {
            apiUrl = `/me/drive/root:/${onedrivePath}/${filename}:/content`;
        } else {
            apiUrl = `/me/drive/root:/${filename}:/content`;
        }

        const { data } = await axios.put(`${this.baseUrl}${apiUrl}?@microsoft.graph.conflictBehavior=rename`, buffer, {
            headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            onUploadProgress(progressEvent) {
                if (typeof onUploadProgress === "function") {
                    onUploadProgress(getPercentageUploadProgress(progressEvent.loaded, progressEvent.total!))
                }
            },
            signal
        });

        return data;

    }

}

const onedriveClient = OneDrive.getInstance();
export default onedriveClient;