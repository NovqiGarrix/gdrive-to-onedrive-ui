import type { Provider } from "../types";
import cleanPathFromFolderId from "./cleanPathFromFolderId";
import getParentIdFromPath from "./getParentIdFromPath";


export default function getParentIdOrPathOfFolder(path: string | undefined, providerId: Provider) {
    // Google Drive
    if (providerId.includes('google')) {
        return getParentIdFromPath(path);
    }

    // Onedrive
    return cleanPathFromFolderId(path);
}