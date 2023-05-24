export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    realmQid: string;
    defaultProviderId: Provider;
}

export type Provider = 'google_drive' | 'google_photos' | 'onedrive';

export interface GlobalItemTypes {
    id: string;
    name: string;
    webUrl: string;
    type: 'folder' | 'file';
    from: Provider;
    iconLink: string;
    downloadUrl: string;
    createdAt: Date;

    image?: string;
    mimeType?: string;
}

export interface GetFilesReturn {
    files: Array<GlobalItemTypes>;
    nextPageToken?: string
};

export interface DriveList {
    kind: string;
    incompleteSearch: boolean;
    files: DriveItem[];
}

export interface DriveItem {
    kind: string;
    fileExtension: string;
    copyRequiresWriterPermission: boolean;
    md5Checksum: string;
    writersCanShare: boolean;
    viewedByMe: boolean;
    mimeType: string;
    parents: string[];
    thumbnailLink: string;
    iconLink: string;
    shared: boolean;
    headRevisionId: string;
    webViewLink: string;
    webContentLink: string;
    size: string;
    viewersCanCopyContent: boolean;
    hasThumbnail: boolean;
    spaces: string[];
    id: string;
    name: string;
    starred: boolean;
    trashed: boolean;
    explicitlyTrashed: boolean;
    createdTime: string;
    modifiedTime: string;
    modifiedByMeTime: string;
    quotaBytesUsed: string;
    version: string;
    originalFilename: string;
    ownedByMe: boolean;
    fullFileExtension: string;
    isAppAuthorized: boolean;
    thumbnailVersion: string;
    modifiedByMe: boolean;
    permissionIds: string[];
    linkShareMetadata: LinkShareMetadata;
}

interface LinkShareMetadata {
    securityUpdateEligible: boolean;
    securityUpdateEnabled: boolean;
}

interface OneDriveParentReference {
    driveType: string;
    driveId: string;
    id: string;
    path: string;
}

export interface OneDriveFolder {
    childCount: number;
}

export interface OneDriveItem {
    '@microsoft.graph.downloadUrl': string;
    createdDateTime: string;
    eTag: string;
    id: string;
    lastModifiedDateTime: string;
    name: string;
    webUrl: string;
    cTag: string;
    size: number;
    file: {
        mimeType: string,
        hashes: {
            quickXorHash: string
        }
    };
    parentReference: OneDriveParentReference;
    folder?: OneDriveFolder;
    video?: {},
    image?: {
        width: number;
        height: number;
    }
}

export interface PhotosItem {
    id: string;
    productUrl: string;
    baseUrl: string;
    mimeType: string;
    mediaMetadata: PhotosMediaMetadata;
    filename: string;
}

interface PhotosMediaMetadata {
    creationTime: string;
    width: string;
    height: string;
}

export interface ProviderObject {
    id: Provider;
    name: string;
    image: string;
    accountId: string;
}

export interface TransferFileSchema {
    id: string;
    name: string;
    iconLink: string;
    downloadUrl: string;
    providerId: Provider;

    mimeType?: string;
}

export interface IDeleteFilesParam {
    id: string;
    name: string;
}

export interface GooglePhotosFilter {
    mediaTypes?: Array<string>;
    contentCategories?: Array<string>;
    dateRanges?: {
        startDate?: Date;
        endDate?: Date;
    },
    includeArchivedMedia?: boolean;
    onlyFavorites?: boolean;
}

export interface GetFilesFuncParams {
    path?: string;
    query?: string;
    foldersOnly?: boolean;
    nextPageToken?: string;
    filters?: GooglePhotosFilter;
}

type Account = 'google' | 'microsoft';

export interface AccountObject {
    id: Account,
    name: string,
    image: string;
    isConnected: boolean;
    providers: Array<Provider>;
}

export type UploadStatus = 'starting' | 'failed' | 'completed' | 'canceled' | 'in_progress';

export type UploadInfoProgress = {
    id: string;
    fileId: string;
    filename: string;
    iconLink: string;
    progress: number;
    status: UploadStatus;
    providerSourceId: Provider;
    providerTargetId: Provider;
    upload: () => Promise<void>;

    error?: string;
};

export type OnUploadProgress = (progress: number) => void;

export type OnDownloadProgress = (progress: number) => void;

export interface ITransferFileParams {
    id: string;
    path: string | undefined;
    providerTargetId: Provider;
}

export interface IUploadFileParams {
    file: File;
    signal: AbortSignal;
    onUploadProgress: OnUploadProgress;

    path: string | undefined;
}

export interface TransferSession {
    _id: string;
    userId: string;
    fileId: string;
    filename: string;
    fileMimeType: string;
    providerTargetId: Provider;
    providerSourceId: Provider;
    progress: number;
    status: UploadStatus;
    error?: string;
    transferToPath?: string;
}