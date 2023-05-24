import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import realm from '../lib/realm';
import type { TransferSession } from '../types';

import getIconExtensionUrl from '../utils/getIconExtensionUrl';
import createUploadInfoProgress from '../utils/createUploadInfoProgress';

import useUser from './useUser';
import useUploadInfoProgress from './useUploadInfoProgress';

export default function useUpdateUploadInfo() {

    const { update, clear, setShow } = useUploadInfoProgress((s) => ({
        setShow: s.setShow,
        clear: s.clearUploadInfoProgress,
        update: s.updateUploadInfoProgress,
    }), shallow);
    const { realmQid, userId } = useUser((s) => ({ realmQid: s.user.realmQid, userId: s.user.id }), shallow);

    useEffect(() => {
        if (!realmQid) return;

        (async function () {

            try {

                const realmUser = await realm.signin(realmQid);
                const uploadsCollection = realmUser.mongoClient('mongodb-atlas').db('cl-uploader').collection<TransferSession>('uploads');

                const unfinishedTransfers = await uploadsCollection.find({ userId, status: { $in: ['in_progress', 'starting'] } }, { projection: { createdAt: 0, updatedAt: 0 } });

                // Get current transfer session from state
                // to check whether the transfer sessions already added to the state
                // This is the case where the user closes the page while transferring files
                const infos = useUploadInfoProgress.getState().uploadInfoProgress;

                const unfinishedIds = unfinishedTransfers.map((ut) => {
                    if (!infos.find((info) => info.fileId === ut.fileId)) {
                        createUploadInfoProgress({
                            fileId: ut.fileId,
                            fileName: ut.filename,
                            transferToPath: ut.transferToPath,
                            fileProviderId: ut.providerSourceId,
                            providerTargetId: ut.providerTargetId,
                            fileIconLink: getIconExtensionUrl(ut.filename, ut.fileMimeType)
                        });
                    }

                    return ut._id;
                });

                // Show upload info progress if its invisible
                if (unfinishedIds.length) setShow(true);

                for await (const change of uploadsCollection.watch({ ids: unfinishedIds })) {
                    if (change.operationType === 'update') {
                        const doc = change.fullDocument;
                        if (!doc) return;

                        update({
                            fileId: doc.fileId,
                            progress: doc.progress,
                            status: doc.status,
                            error: doc.error
                        });
                    } else if (change.operationType === 'delete') {

                        // Check if the deleted transfer session is still loading
                        const deletedInfoProgress = infos.find((f) => f.id === change.documentKey._id);
                        if (!deletedInfoProgress) return;

                        update({
                            fileId: deletedInfoProgress.fileId,
                            error: 'Unfortunately. Server has stopped this transfer',
                            status: 'failed'
                        });
                    }
                }

            } catch (error) {
                console.info(error);
            }

        })()

        return () => {
            clear();
            realm.logout();
        }

    }, [clear, realmQid, setShow, update, userId]);

}