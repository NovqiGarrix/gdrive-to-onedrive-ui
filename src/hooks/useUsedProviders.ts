import { create } from 'zustand';

import { PROVIDERS } from '../constants';
import type { ProviderObject } from '../types';

interface IUsedProviders {

    isInitialized: boolean;

    usedProviders: Set<ProviderObject>;
    initialUsedProviders: Set<ProviderObject>;

    has: (provider: ProviderObject) => boolean;
    replaceProvider: (prev: ProviderObject, next: ProviderObject) => void;

}

const useUsedProviders = create<IUsedProviders>((set, get) => ({

    isInitialized: false,

    usedProviders: new Set(),
    initialUsedProviders: new Set(),

    replaceProvider(prev, next) {
        const usedProviders = get().usedProviders;
        usedProviders.delete(prev);
        set({ usedProviders: usedProviders.add(next) });
    },

    has(provider: ProviderObject) {
        return get().usedProviders.has(provider);
    }

}));

export function initializeUsedProviders(providers?: { p1: number; p2: number }) {
    if (!providers) return;
    console.log({ isInitialized: useUsedProviders.getState().isInitialized });

    const initialUsedProviders = new Set<ProviderObject>();

    const providersMaxIndex = PROVIDERS.length - 1;

    let p1 = providers.p1;
    let p2 = providers.p2;

    if (p1 > providersMaxIndex) {
        p1 = 0;
    }

    if (p2 > providersMaxIndex) {
        p2 = 2;
    }

    if (p1 === p2) {
        p2 = p1 <= 0 ? p1 + 1 : p1 - 1;
    }

    // Index 0 is Google Drive
    initialUsedProviders.add(PROVIDERS[p1]);

    // Index 2 is Onedrive
    initialUsedProviders.add(PROVIDERS[p2]);

    // For more info check:
    // src/constants.ts > PROVIDERS

    useUsedProviders.setState({
        isInitialized: true,
        usedProviders: initialUsedProviders,
        ...(useUsedProviders.getState().isInitialized ? {} : { initialUsedProviders })
    });
}

export default useUsedProviders;