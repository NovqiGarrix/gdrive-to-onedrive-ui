import { create } from "zustand";
import { GooglePhotosFilter } from "../types";

interface IGooglePhotosFilter {

    contentFilter: Array<string>;

    addContentFilter: (content: string) => void;

    removeContentFilter: (content: string) => void;

    mediaTypeFilter: Array<string>;

    addMediaTypeFilter: (mediaType: string) => void;

    removeMediaTypeFilter: (mediaType: string) => void;

    isIncludeFavorites: boolean | undefined;
    setIncludeFavorites: (isIncludeFavorites: boolean) => void;

    isIncludeArchived: boolean | undefined;
    setIncludeArchived: (isIncludeArchived: boolean) => void;

    startDate: Date | null;
    setStartDate: (startDate: Date) => void;

    endDate: Date | null;
    setEndDate: (endDate: Date) => void;

    formattedFilters: GooglePhotosFilter | undefined;
    setFormmatedFilters: (formattedFilters: GooglePhotosFilter) => void;

}

const useGooglePhotosFilter = create<IGooglePhotosFilter>((set) => ({

    contentFilter: [],

    addContentFilter: (content: string) => {
        set((state) => ({
            contentFilter: [...state.contentFilter, content],
        }));
    },

    removeContentFilter: (content: string) => {
        set((state) => ({
            contentFilter: state.contentFilter.filter((item) => item !== content),
        }));
    },

    mediaTypeFilter: [],

    addMediaTypeFilter: (mediaType: string) => {
        set((state) => ({
            mediaTypeFilter: [...state.mediaTypeFilter, mediaType],
        }));
    },

    removeMediaTypeFilter: (mediaType: string) => {
        set((state) => ({
            mediaTypeFilter: state.mediaTypeFilter.filter((item) => item !== mediaType),
        }));
    },

    isIncludeFavorites: undefined,
    setIncludeFavorites(isIncludeFavorites) {
        set({ isIncludeFavorites });
    },

    isIncludeArchived: undefined,
    setIncludeArchived(isIncludeArchived) {
        set({ isIncludeArchived });
    },

    startDate: null,
    setStartDate(startDate) {
        set({ startDate });
    },

    endDate: null,
    setEndDate(endDate) {
        set({ endDate });
    },

    formattedFilters: undefined,
    setFormmatedFilters(formattedFilters) {
        set({ formattedFilters });
    }

}));

export default useGooglePhotosFilter;