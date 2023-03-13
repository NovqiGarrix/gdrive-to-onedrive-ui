import type { ProviderObject } from "./types";

export const MAX_PER_PAGE = 20;

export const ERROR_500_MESSAGE = 'Something went wrong';

export const PROVIDERS: Array<ProviderObject> = [
    {
        id: 'google_drive',
        name: 'Google Drive',
        image: '/google-drive.webp'
    },
    {
        id: 'google_photos',
        name: 'Google Photos',
        image: '/google-photos.webp'
    },
    {
        id: 'onedrive',
        name: 'OneDrive',
        image: '/onedrive.webp'
    }
]