import { create } from "zustand";
import type { ProviderObject } from "../types";

interface UseNewFolderModal {
    open: boolean;
    setOpen: (open: boolean) => void;

    queryKey?: Array<any>;
    provider?: ProviderObject;
}

const useNewFolderModal = create<UseNewFolderModal>((set) => ({

    open: false,

    setOpen(open) {
        set({ open })
    },

    queryKey: undefined,

    provider: undefined

}));

export default useNewFolderModal;