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

export function initializeCloudProvider(p: string | undefined) {
    let provider = p ? PROVIDERS.find((provider) => provider.id === p) : PROVIDERS[0];
    if (!provider) toast('Invalid provider. Using default provider');

    useCloudProvider.setState({ provider, isInitialized: true });
}

export default useCloudProvider;