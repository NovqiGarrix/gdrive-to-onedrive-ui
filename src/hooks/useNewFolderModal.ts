import { create } from "zustand";
import type { Provider } from "../types";

interface UseNewFolderModal {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const useNewFolderModal = create<UseNewFolderModal>((set) => ({

    open: false,

    setOpen(open) {
        set({ open })
    },

}));

export default useNewFolderModal;