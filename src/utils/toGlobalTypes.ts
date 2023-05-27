import type {
    DriveItem,
    GlobalItemTypes,
    OneDriveItem,
    PhotosItem,
    Provider
} from "../types";

import getIconExtensionUrl from "./getIconExtensionUrl";

export default function toGlobalTypes(data: any, provider: Provider): GlobalItemTypes {

    switch (provider) {
        case 'google_drive': {
            const d = data as DriveItem;
            const isFolder = d.mimeType === 'application/vnd.google-apps.folder';

            return {
                id: d.id,
                from: provider,
                name: d.name,
                type: isFolder ? 'folder' : 'file',
                mimeType: d.mimeType,
                webUrl: d.webViewLink,
                image: (() => {

                    if (d.mimeType.includes("image")) {
                        return d.webContentLink;
                    } else if (d.hasThumbnail) {
                        return d.thumbnailLink
                    } else {
                        return undefined
                    }

                })(),
                iconLink: getIconExtensionUrl(d.name, d.mimeType),
                downloadUrl: d.webContentLink,
                createdAt: new Date(d.createdTime)
            }
        }

        case 'google_photos': {
            const d = data as PhotosItem;
            return {
                id: d.id,
                type: 'file',
                from: provider,
                name: d.filename,
                webUrl: d.productUrl,
                downloadUrl: `${d.baseUrl}=d`,
                image: `${d.baseUrl}=w800-h800`,
                iconLink: getIconExtensionUrl(d.filename),
                createdAt: new Date(d.mediaMetadata.creationTime),
            }
        }

        case 'onedrive': {
            const d = data as OneDriveItem;
            d.createdDateTime
            const extension = d.name.split('.').pop();

            return {
                id: d.id,
                from: provider,
                name: d.name,
                type: d.folder ? 'folder' : 'file',
                webUrl: d.webUrl,
                iconLink: getIconExtensionUrl(d.name, d.file?.mimeType),
                createdAt: new Date(d.createdDateTime),
                downloadUrl: d["@microsoft.graph.downloadUrl"],
                image: d.file?.mimeType.includes("image") || extension === "webp" ? d["@microsoft.graph.downloadUrl"] : undefined,
            }
        }

        default:
            throw new Error('Invalid Provider!');
    }

}