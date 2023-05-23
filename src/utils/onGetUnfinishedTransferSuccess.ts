import type { GetFileFunction } from "../apis";
import useTransferToPath from "../hooks/useTransferToPath";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";
import type { Provider, TransferSession, UploadInfoProgress } from "../types";

import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";
import googlephotosApi from "../apis/googlephotos.api";

import createUploadInfoProgress from "./createUploadInfoProgress";

function getFileFunc(fileProviderId: Provider): GetFileFunction {

    switch (fileProviderId) {
        case 'google_drive':
            return googledriveApi.getFile

        case 'google_photos':
            return googlephotosApi.getFile

        case 'onedrive':
            return onedriveApi.getFile

        default:
            throw new Error('Unsupported provider.');
    }

}

export default async function onGetUnfinishedTransferSuccess(data: Array<TransferSession>) {

    if (!data.length) return;

    try {
        const uploadInfoProgresss = (await Promise.all(
            data.map(async (transferSession) => {

                try {

                    const file = await (getFileFunc(transferSession.providerSourceId)(transferSession.fileId));

                    const uploadInfoProgress = createUploadInfoProgress({
                        fileId: file.id,
                        fileIconLink: file.iconLink,
                        fileName: file.name,
                        fileProviderId: file.from,
                        transferToPath: transferSession.transferToPath,
                        providerTargetId: transferSession.providerTargetId,
                    });

                    return uploadInfoProgress;

                } catch (error) {
                    return undefined;
                }

            })
        )).filter(Boolean) as Array<UploadInfoProgress>;


        const setShowUploadInfoProgress =
            useUploadInfoProgress.getState().setShow;

        // Show upload info progress,
        setShowUploadInfoProgress(true);

    } catch (error) {
        console.log(error)
    } finally {
        // Set the transfer path back to undefined
        // for the next transfer
        useTransferToPath.setState({ path: undefined });
    }

}