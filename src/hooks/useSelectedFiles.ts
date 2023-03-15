import { create } from 'zustand';
import { toast } from 'react-hot-toast';

import type { GlobalItemTypes, Provider } from '../types';

type File = GlobalItemTypes & { providerId: Provider };

interface ISelectedFiles {
    cleanFiles: () => void;

    files: File[];

    has: (fileId: string) => boolean;

    addFile: (file: File) => void;

    replaceAllFiles: (file: File | Array<File>) => void;
}

const useSelectedFiles = create<ISelectedFiles>((set, get) => ({

    cleanFiles: () => set({ files: [] }),

    files: [],

    has: (fileId) => !!get().files.find((file) => file.id === fileId),

    addFile(file) {
        const addedFiles = get().files;
        if (addedFiles.find((f) => f.id === file.id)) return;

        if (addedFiles.find((f) => f.providerId !== file.providerId)) {
            toast.error('You can only select files from the same provider');
            return;
        }

        console.log({ addedFiles, file });

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