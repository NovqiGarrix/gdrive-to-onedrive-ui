import { create } from "zustand";

interface IUseShowSettingsModal {
    open: boolean;

    setOpen: (show: boolean) => void;
}

const useShowSettingsModal = create<IUseShowSettingsModal>((set) => ({
    open: false,

    setOpen: (show) => set({ open: show }),

}));

export default useShowSettingsModal;