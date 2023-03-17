import { create } from "zustand";

interface IUseProviderPath {

    p1: string | undefined;

    setP1: (p1: string | undefined) => void;

    p2: string | undefined;

    setP2: (p2: string | undefined) => void;

    isInitialized: boolean;

}

const useProviderPaths = create<IUseProviderPath>((set) => ({

    p1: undefined,

    setP1: (p1) => set({ p1 }),

    p2: undefined,

    setP2: (p2) => set({ p2 }),

    isInitialized: false,

}));

export default useProviderPaths;

export function initializedProviderPathStore(paths: { p1: string; p2: string } | undefined) {
    if (!paths || useProviderPaths.getState().isInitialized) return;

    const { p1, p2 } = paths;
    if (!p1 || !p2) return;

    useProviderPaths.setState({ p1, p2, isInitialized: true });
}