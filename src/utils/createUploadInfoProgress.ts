import type {
    Provider,
    UploadInfoProgress,
    ITransferFileParams
} from "../types";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";
import googlephotosApi from "../apis/googlephotos.api";

function transferFileFunc(providerId: Provider, params: ITransferFileParams): Promise<string> {
    switch (providerId) {
        case "onedrive": {
            return onedriveApi.transferFile(params);
        }

        case "google_photos": {
            return googlephotosApi.transferFile(params);
        }

        case "google_drive": {
            return googledriveApi.transferFile(params);
        }

        default:
            throw new Error("Unsupported Provider!");
    }
}

interface CreateUploadInfoProgressParams {
    fileId: string;
    fileName: string;
    fileIconLink: string;
    fileProviderId: Provider;
    providerTargetId: Provider;

    transferToPath?: string;
}

export default function createUploadInfoProgress(params: CreateUploadInfoProgressParams): UploadInfoProgress {

    const { providerTargetId, transferToPath, fileId, fileProviderId, fileIconLink, fileName } = params;

    const requiredParams: UploadInfoProgress = {
        // Set to empty string for now
        // Will be updated when FileOptions.transferFiles call the `upload` function
        id: '',
        fileId,
        progress: 0,
        providerTargetId,
        status: 'starting',
        filename: fileName,
        iconLink: fileIconLink,
        providerSourceId: fileProviderId,
        upload: () => transferFileFunc(fileProviderId, { id: fileId, providerTargetId, path: transferToPath }),
    };

    const { uploadInfoProgress, updateUploadInfoProgress, addUploadInfoProgress } = useUploadInfoProgress.getState();

    const isExist = uploadInfoProgress.find((f) => f.fileId === fileId);
    if (isExist) {
        updateUploadInfoProgress({ ...requiredParams, fileId });
    } else {
        addUploadInfoProgress(requiredParams);
    }

    return requiredParams;

}
