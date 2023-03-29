import { create } from 'zustand';
import { toast } from 'react-hot-toast';

import { PROVIDERS } from '../constants';
import type { ProviderObject } from '../types';

interface IUseCloudProvider {

    provider: ProviderObject;

    setProvider: (provider: ProviderObject) => void;

    isInitialized: boolean;
}

const useCloudProvider = create<IUseCloudProvider>((set) => ({

    provider: PROVIDERS[0],

    setProvider(provider) {
        set({ provider });
    },

    isInitialized: false,

}));

class UseCloudProviderMem {
    public static isRunning = false;
}

export function initializeCloudProvider(p: string | undefined | null) {
    if (UseCloudProviderMem.isRunning) return;
    let provider = PROVIDERS.find((provider) => provider.id === p);
    if (!provider) {
        if (p) {
            /**
             * Only show toast if provider is invalid
             * So, if the query params are empty, it won't show
             */
            toast.success('Invalid provider. Using default provider');
        }
        provider = PROVIDERS[0];
    }

    useCloudProvider.setState({ provider, isInitialized: true });
    UseCloudProviderMem.isRunning = true;
}

export default useCloudProvider;