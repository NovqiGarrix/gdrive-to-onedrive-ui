import { create } from 'zustand';
import { PROVIDERS } from '../constants';
import type { ProviderObject } from '../types';

interface IUsedProviders {

    usedProviders: Set<ProviderObject>;
    initialUsedProviders: Set<ProviderObject>;

    replaceProvider: (prev: ProviderObject, next: ProviderObject) => void;
    getProviders: () => Array<ProviderObject>;
    getInitialProviders: () => Array<ProviderObject>;

    has: (provider: ProviderObject) => boolean;

}

const useUsedProviders = create<IUsedProviders>((set, get) => ({

    // PROVIDERS[0] = Google Drive
    // PROVIDERS[2] = OneDrive
    usedProviders: new Set([PROVIDERS[0], PROVIDERS[2]]),
    initialUsedProviders: new Set([PROVIDERS[0], PROVIDERS[2]]),

    replaceProvider(prev, next) {
        const usedProviders = get().usedProviders;
        usedProviders.delete(prev);
        set({ usedProviders: usedProviders.add(next) });
    },

    getProviders() {
        return Array.from(get().usedProviders);
    },

    getInitialProviders() {
        return Array.from(get().initialUsedProviders);
    },

    has(provider: ProviderObject) {
        return get().usedProviders.has(provider);
    }

}));

export default useUsedProviders;