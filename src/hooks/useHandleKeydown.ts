import { useEffect } from "react";

import useSelectedFiles from "./useSelectedFiles";
import useDeleteFilesModalState from "./useDeleteFilesModalState";

export default function useHandleKeydown() {

    const selectedFiles = useSelectedFiles((state) => state.files);
    const setModalOpen = useDeleteFilesModalState((state) => state.setOpen);

    useEffect(() => {

        if (!selectedFiles.length) return;

        const handleKeydown = (e: KeyboardEvent) => {
            if (e.code === 'Delete') {
                setModalOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeydown);

        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };

    }, [selectedFiles.length, setModalOpen]);


}