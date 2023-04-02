import { create } from "zustand";

interface DeleteModalParams {
    debounceQuery: string;
    path: string | undefined;
}

type IDeleteFilesModalState = {
    open: boolean;
    openModal: (params: DeleteModalParams) => void;
    closeModal: () => void;
} & DeleteModalParams;

const useDeleteFilesModalState = create<IDeleteFilesModalState>((set) => ({
    open: false,

    openModal(params) {
        set({ open: true, ...params });
    },

    closeModal() {
        set({ open: false, debounceQuery: "", path: undefined });
    },

    debounceQuery: "",

    path: undefined,

}));

export default useDeleteFilesModalState;