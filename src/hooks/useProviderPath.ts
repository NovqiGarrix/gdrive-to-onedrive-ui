import { create } from "zustand";

interface IUseProviderPath {

    path: string | undefined;
    setPath: (path: string | undefined) => void;

}

const useProviderPath = create<IUseProviderPath>((set) => ({

    path: undefined,

    setPath(path) {
        set({ path });
    },

}));

export default useProviderPath;

class UseProviderPathMem {
    public static isRunning = false;
}

export function initializedProviderPath(path: string | undefined | null) {
    if (UseProviderPathMem.isRunning) return;

    useProviderPath.setState({ path: path || undefined });
    UseProviderPathMem.isRunning = true;
}