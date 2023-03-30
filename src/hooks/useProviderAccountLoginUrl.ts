import { create } from "zustand";

interface IUseProviderAccountLoginUrl {
    url: string;

    setUrl: (url: string) => void;
}

const useProviderAccountLoginUrl = create<IUseProviderAccountLoginUrl>((set) => ({

    url: "",

    setUrl: (url: string) => set({ url })

}));

export default useProviderAccountLoginUrl;