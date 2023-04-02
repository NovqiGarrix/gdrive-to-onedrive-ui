import axios from 'axios';
import mime from 'mime-types'
    ;
import type { OnUploadProgress } from '../types';
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";
import getPercentageUploadProgress from '../utils/getPercentageUploadProgress';

const MAX_PHOTO_SIZE = 1024 * 1024 * 200 // 200MB;
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024 * 20 // 20GB;

const ALLOWEED_PHOTO_EXTENSIONS = 'BMP, GIF, HEIC, ICO, JPG, PNG, TIFF, WEBP, RAW'.split(', ').map((ext) => ext.toLowerCase());
const ALLOWEED_VIDEO_EXTENSIONS = '3GP, 3G2, ASF, AVI, DIVX, M2T, M2TS, M4V, MKV, MMV, MOD, MOV, MP4, MPG, MTS, TOD, WMV'.split(', ').map((ext) => ext.toLowerCase());

interface IUploadFileParams {
    buffer: Buffer;
    filename: string;
    accessToken: string;
    signal: AbortSignal;
    onUploadProgress: OnUploadProgress;
}

class GooglePhotos {

    private static instance: GooglePhotos;

    private endpoint = 'https://photoslibrary.googleapis.com/v1';
    private getHeaders: (accessToken: string) => HeadersInit = (accessToken: string) => ({
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    })

    public static getInstance() {
        if (this.instance) return this.instance;

        this.instance = new GooglePhotos();
        return this.instance;
    }

    private constructor() {
        if (GooglePhotos.instance) throw new Error("Initialize the Class using GooglePhotos.getInstance()");
    }

    async uploadFile(params: IUploadFileParams): Promise<void> {

        const { accessToken, filename, buffer, onUploadProgress, signal } = params;

        this.validateFile(filename, buffer.byteLength);
        const mimeType = mime.lookup(filename) as string;

        try {

            const { data: uploadToken, headers, status, statusText } = await axios.post(`${this.endpoint}/uploads`, buffer, {
                // @ts-ignore
                headers: {
                    ...this.getHeaders(accessToken),
                    "Content-Type": "application/octet-stream",
                    "X-Goog-Upload-Protocol": 'raw',
                    "X-Goog-Upload-Content-Type": mimeType
                },
                onUploadProgress: (progressEvent) => {
                    onUploadProgress(getPercentageUploadProgress(progressEvent.loaded, progressEvent.total!));
                },
                responseType: 'text',
                signal
            });

            const contentType = headers['content-type'];
            if (contentType !== 'text/plain') {
                throw new HttpErrorExeption(status, statusText);
            }

            const body = {
                newMediaItems: [
                    {
                        simpleMediaItem: {
                            uploadToken,
                            fileName: filename
                        }
                    }
                ]
            }

            const { data, status: batchRespStatus } = await axios.post(`${this.endpoint}/mediaItems:batchCreate`, body, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                signal
            });

            if (data.error) {
                throw new HttpErrorExeption(batchRespStatus, data.error.message);
            }

            return data.newMediaItemResults[0].mediaItem;

        } catch (error) {
            throw new HttpErrorExeption(500, 'Something went wrong...');
        }

    }

    private validateFile(filename: string, byteLength: number) {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (!ext
            ||
            (!ALLOWEED_PHOTO_EXTENSIONS.includes(ext) && !ALLOWEED_VIDEO_EXTENSIONS.includes(ext)) ||
            byteLength > MAX_PHOTO_SIZE && ALLOWEED_PHOTO_EXTENSIONS.includes(ext) ||
            byteLength > MAX_VIDEO_SIZE && ALLOWEED_VIDEO_EXTENSIONS.includes(ext)
        ) {
            throw new HttpErrorExeption(400, 'Invalid file extension');
        }
    }

}

const googlephotosClient = GooglePhotos.getInstance();
export default googlephotosClient;