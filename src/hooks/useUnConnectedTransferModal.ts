import { create } from 'zustand';
import type { Provider } from '../types';

interface UseUnConnectedTranferModal {
    open: boolean;
    setOpen: (open: boolean) => void;
    unConnectedProviderId: Provider | undefined;
}

const useUnConnectedTranferModal = create<UseUnConnectedTranferModal>((set) => ({

    open: false,

    setOpen(open) {
        set({ open });
    },

    unConnectedProviderId: undefined,

}));

export default useUnConnectedTranferModal;