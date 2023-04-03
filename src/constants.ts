import type { AccountObject, ProviderObject } from "./types";

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

export const NEXT_PUBLIC_INFILE_HELPER_URL = process.env.NEXT_PUBLIC_INFILE_HELPER_URL;
if (!NEXT_PUBLIC_INFILE_HELPER_URL) throw new Error('Missing NEXT_PUBLIC_INFILE_HELPER_URL from env variable');