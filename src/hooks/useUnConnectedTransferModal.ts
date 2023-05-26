import { create } from 'zustand';
import type { Provider } from '../types';

interface UseUnConnectedTranferModal {
    open: boolean;
    unConnectedProviderId: Provider | undefined;
}

const useUnConnectedTranferModal = create<UseUnConnectedTranferModal>(() => ({

    open: false,

    unConnectedProviderId: undefined,

}));

export default useUnConnectedTranferModal;