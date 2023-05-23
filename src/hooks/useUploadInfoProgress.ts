import { create } from "zustand";
import type { UploadInfoProgress } from "../types";

interface UseUploadInfoProgress {
    show: boolean;
    setShow: (show: boolean) => void;

    uploadInfoProgress: UploadInfoProgress[];
    addUploadInfoProgress: (uploadInfoProgress: UploadInfoProgress) => void;
    removeUploadInfoProgress: (id: string) => void;
    updateUploadInfoProgress: (uploadInfoProgress: Partial<UploadInfoProgress> & { fileId: string }) => void;

    clearUploadInfoProgress: () => void;
}

const useUploadInfoProgress = create<UseUploadInfoProgress>((set) => ({

    show: false,

    setShow(show) {
        set({ show });
    },

    uploadInfoProgress: [],
    // uploadInfoProgress: TEMP_UPLOAD_INFO_PROGRESS,

    addUploadInfoProgress(uploadInfoProgress) {
        set((state) => ({
            uploadInfoProgress: [...state.uploadInfoProgress, uploadInfoProgress],
        }));
    },

    updateUploadInfoProgress(uploadInfoProgress) {
        set((state) => ({
            uploadInfoProgress: state.uploadInfoProgress.map((item) =>
                item.fileId === uploadInfoProgress.fileId ? { ...item, ...uploadInfoProgress } : item
            ),
        }));
    },

    removeUploadInfoProgress(id) {
        set((state) => ({
            uploadInfoProgress: state.uploadInfoProgress.filter((item) => item.fileId !== id),
        }));
    },

    clearUploadInfoProgress() {
        set(({ uploadInfoProgress: [], show: false }));
    }
}));

export default useUploadInfoProgress;