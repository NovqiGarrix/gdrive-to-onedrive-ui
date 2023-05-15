import {
    useEffect, useRef,
    // @ts-ignore - No types
    experimental_useEffectEvent as useEffectEvent,
} from 'react';
import { shallow } from 'zustand/shallow';
import socket, { Socket } from 'socket.io-client';

import useUser from './useUser';
import useUploadInfoProgress from './useUploadInfoProgress';
import { UPLOAD_STATUS_EVENT, UPLOAD_PROGRESS_EVENT } from '../constants';

export default function useSocketIo() {

    const ioRef = useRef<Socket>();
    const user = useUser((s) => s.user, shallow);

    const emitAddClient = useEffectEvent((userId: string) => {
        ioRef.current?.emit('ADD_CLIENT', userId);
    });

    const updateUploadInfoProgress = useUploadInfoProgress(
        (s) => s.updateUploadInfoProgress
    );

    useEffect(() => {

        ioRef.current = socket(process.env.NEXT_PUBLIC_CL_UPLOADER!, { autoConnect: true });

        const io = ioRef.current;
        emitAddClient(user.id);

        function onUploadProgressChange({ fileId, progress }: any) {
            updateUploadInfoProgress({
                id: fileId,
                progress
            });
        }

        function onUploadStatusChange({ fileId, status, error }: any) {
            updateUploadInfoProgress({
                id: fileId,
                error,
                status
            });
        }

        io.on(UPLOAD_STATUS_EVENT, onUploadStatusChange);
        io.on(UPLOAD_PROGRESS_EVENT, onUploadProgressChange);

        return () => {
            io.close();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateUploadInfoProgress]);

    return ioRef.current;

}