import { create } from "zustand";
import { Provider } from "../types";

interface DeleteModalParams {
    debounceQuery: string;
    path: string | undefined;
    providerId: Provider | undefined;
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
        set({ open: false, debounceQuery: "", path: undefined, providerId: undefined });
    },

    debounceQuery: "",

    path: undefined,

    providerId: undefined,

}));

export default useDeleteFilesModalState;