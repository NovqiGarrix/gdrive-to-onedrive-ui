import { create } from "zustand";

interface IUseProviderPath {

    path: string | undefined;
    setPath: (path: string | undefined) => void;

    isInitialized: boolean;

}

const useProviderPath = create<IUseProviderPath>((set) => ({

    path: undefined,

    setPath(path) {
        set({ path });
    },

    isInitialized: false,

}));

export default useProviderPath;

export function initializedProviderPath(path: string | undefined) {
    if (useProviderPath.getState().isInitialized) return;
    useProviderPath.setState({ path, isInitialized: true });
}