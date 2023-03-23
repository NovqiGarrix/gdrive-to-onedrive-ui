import { create } from "zustand";

interface UseUploadSAbortControllers {

    signals: Array<AbortController>;

    addAbortController: (signal: AbortController) => void;

    removeAbortController: (signal: AbortController) => void;

}

const useUploadAbortControllers = create<UseUploadSAbortControllers>((set) => ({

    signals: [],

    addAbortController(signal) {
        set((state) => ({
            signals: [...state.signals, signal]
        }));
    },

    removeAbortController(signal) {
        set((state) => ({
            signals: state.signals.filter((s) => s !== signal)
        }));
    },

}));

export default useUploadAbortControllers;