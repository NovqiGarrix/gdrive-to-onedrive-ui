import { create } from "zustand";

type IDeleteFilesModalState = {
    open: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const useDeleteFilesModalState = create<IDeleteFilesModalState>((set) => ({
    open: false,

    openModal() {
        set({ open: true });
    },

    closeModal() {
        set({ open: false });
    },
}));

export default useDeleteFilesModalState;