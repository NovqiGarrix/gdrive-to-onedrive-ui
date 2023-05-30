import { create } from "zustand";

interface UseIsShowingOptions {
    show: boolean;
    setShow: (show: boolean) => void;
}

const useIsShowingOptions = create<UseIsShowingOptions>((set) => ({

    show: false,

    setShow(show) {
        set({ show });
    },

}));

export default useIsShowingOptions;