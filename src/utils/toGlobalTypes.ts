import { DriveItem, GlobalItemTypes, OneDriveItem, PhotosItem, Provider } from "../types";
import getIconExtensionUrl from "./getIconExtensionUrl";

export default function toGlobalTypes(data: any, provider: Provider): GlobalItemTypes {

    switch (provider) {
        case 'google_drive': {
            const d = data as DriveItem;
            return {
                id: d.id,
                from: provider,
                name: d.name,
                type: d.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
                webUrl: d.webViewLink,
                image: d.thumbnailLink,
                iconLink: getIconExtensionUrl(d.name),
                downloadUrl: `https://drive.google.com/uc?export=download&id=${d.id}`
            }
        }

        case 'google_photos': {
            const d = data as PhotosItem;
            return {
                id: d.id,
                from: provider,
                name: d.filename,
                type: 'file',
                webUrl: d.productUrl,
                iconLink: getIconExtensionUrl(d.filename),
                image: `${d.baseUrl}=d`,
                downloadUrl: `${d.baseUrl}=d`
            }
        }

        case 'onedrive': {
            const d = data as OneDriveItem;

            const extension = d.name.split('.').pop();

            return {
                id: d.id,
                from: provider,
                name: d.name,
                type: d.folder ? 'folder' : 'file',
                webUrl: d.webUrl,
                iconLink: getIconExtensionUrl(d.name),
                downloadUrl: d["@microsoft.graph.downloadUrl"],
                image: d.file?.mimeType.includes("image") || extension === "webp" ? d["@microsoft.graph.downloadUrl"] : undefined,
            }
        }

        default:
            throw new Error('Invalid Provider!');
    }

}