import type { AccountObject, ProviderObject, UploadInfoProgress } from "./types";

export const MAX_PER_PAGE = 20;

export const ERROR_500_MESSAGE = 'Something went wrong';

export const PROVIDERS: Array<ProviderObject> = [
    {
        id: 'google_drive',
        name: 'Google Drive',
        image: '/google-drive.webp',
        accountId: 'google'
    },
    {
        id: 'google_photos',
        name: 'Google Photos',
        image: '/google-photos.webp',
        accountId: 'google'
    },
    {
        id: 'onedrive',
        name: 'OneDrive',
        image: '/onedrive.webp',
        accountId: 'microsoft'
    }
]

export const ACCOUNTS: Array<AccountObject> = [
    {
        id: 'google',
        name: 'Google',
        image: '/google.webp',
        isConnected: false
    },
    {
        id: 'microsoft',
        name: 'Microsoft',
        image: '/microsoft.webp',
        isConnected: false
    }
]

export const UPLOAD_CHUNK_SIZE = 1024 * 1024 * 4;

// TODO: Remove this later
export const TEMP_UPLOAD_INFO_PROGRESS: Array<UploadInfoProgress> = [
    {
        isLoading: true,
        uploadProgress: 70,
        downloadProgress: 50,
        abortController: new AbortController(),

        downloadUrl: "",
        iconLink: "/icons/sheets.png",
        id: "1",
        name: "Catatan Keuangan Maret dan April 2023.xlsx",
        upload: () => new Promise<boolean>((resolve) => resolve(true)),
        providerId: 'google_drive'
    },
    {
        isLoading: false,
        uploadProgress: 70,
        downloadProgress: 50,
        abortController: new AbortController(),
        error: "Hello there",

        downloadUrl: "",
        iconLink: "/icons/docs.png",
        id: "2",
        name: "Catatan harian.docs",
        upload: () => new Promise<boolean>((resolve) => resolve(true)),
        providerId: 'google_drive'
    },
    {
        isLoading: false,
        uploadProgress: 100,
        downloadProgress: 100,
        abortController: new AbortController(),

        downloadUrl: "",
        iconLink: "/icons/docs.png",
        id: "3",
        name: "Catatan harian 2.docs",
        upload: () => new Promise<boolean>((resolve) => resolve(true)),
        providerId: 'google_drive'
    },
]