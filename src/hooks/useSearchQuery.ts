import { create } from 'zustand';

interface IUseSearchQuery {
    query: string;
    setQuery: (query: string) => void;

    debounceQuery: string;
    setDebounceQuery: (query: string) => void;
}

const useSearchQuery = create<IUseSearchQuery>((set) => ({
    query: '',

    setQuery(query: string) {
        set({ query });
    },

    debounceQuery: '',
    setDebounceQuery(query: string) {
        set({ debounceQuery: query });
    }
}));

export default useSearchQuery;