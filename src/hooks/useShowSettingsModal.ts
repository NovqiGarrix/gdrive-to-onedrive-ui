import { create } from "zustand";

interface IUseShowSettingsModal {
    open: boolean;

    setOpen: (show: boolean) => void;
}

const useShowSettingsModal = create<IUseShowSettingsModal>((set) => ({
    open: true,

    setOpen: (show) => set({ open: show }),

}));

export default useShowSettingsModal;