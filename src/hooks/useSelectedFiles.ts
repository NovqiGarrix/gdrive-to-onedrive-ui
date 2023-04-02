import { create } from 'zustand';
import type { GlobalItemTypes } from '../types';

interface ISelectedFiles {
    cleanFiles: () => void;

    files: Array<GlobalItemTypes>;

    has: (fileId: string) => boolean;

    addFile: (file: GlobalItemTypes) => void;

    replaceAllFiles: (file: GlobalItemTypes | Array<GlobalItemTypes>) => void;
}

const useSelectedFiles = create<ISelectedFiles>((set, get) => ({

    cleanFiles: () => set({ files: [] }),

    files: [],

    has: (fileId) => !!get().files.find((file) => file.id === fileId),

    addFile(file) {
        const addedFiles = get().files;
        if (addedFiles.find((f) => f.id === file.id)) return;
        set((state) => ({ files: [...state.files, file] }))
    },

    replaceAllFiles(file) {
        if (Array.isArray(file)) {
            set(({ files: file }))
            return;
        }

        set(({ files: [file] }))
    },

}));

export default useSelectedFiles;