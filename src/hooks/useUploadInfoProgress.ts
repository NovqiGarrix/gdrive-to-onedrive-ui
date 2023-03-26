import { create } from "zustand";
import type { UploadInfoProgress } from "../types";

interface UseUploadInfoProgress {
    show: boolean;
    setShow: (show: boolean) => void;

    uploadInfoProgress: UploadInfoProgress[];
    addUploadInfoProgress: (uploadInfoProgress: UploadInfoProgress) => void;
    updateUploadInfoProgress: (uploadInfoProgress: Partial<UploadInfoProgress> & { id: string }) => void;

    clearUploadInfoProgress: () => void;
}

const useUploadInfoProgress = create<UseUploadInfoProgress>((set) => ({

    show: false,
    setShow(show) {
        set({ show });
    },

    uploadInfoProgress: [],
    addUploadInfoProgress(uploadInfoProgress) {
        set((state) => ({
            uploadInfoProgress: [...state.uploadInfoProgress, uploadInfoProgress],
        }));
    },
    updateUploadInfoProgress(uploadInfoProgress) {
        set((state) => ({
            uploadInfoProgress: state.uploadInfoProgress.map((item) =>
                item.id === uploadInfoProgress.id ? { ...item, ...uploadInfoProgress } : item
            ),
        }));
    },
    clearUploadInfoProgress() {
        set(({ uploadInfoProgress: [], show: false }));
    }
}));

export default useUploadInfoProgress;