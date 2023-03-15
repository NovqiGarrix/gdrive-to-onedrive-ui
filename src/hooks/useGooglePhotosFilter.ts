import { create } from "zustand";
import type { DateType } from "react-tailwindcss-datepicker/dist/types";

import { GooglePhotosFilter } from "../types";

interface IGooglePhotosFilter {

    contentFilter: Array<string>;

    addContentFilter: (content: string) => void;

    removeContentFilter: (content: string) => void;

    mediaTypeFilter: Array<string>;

    addMediaTypeFilter: (mediaType: string) => void;

    removeMediaTypeFilter: (mediaType: string) => void;

    onlyFavorites: boolean | undefined;
    setOFavorites: (onlyFavorites: boolean) => void;

    isIncludeArchived: boolean | undefined;
    setIncludeArchived: (isIncludeArchived: boolean) => void;

    startDate: Date | null;
    setStartDate: (startDate: DateType | undefined) => void;

    endDate: Date | null;
    setEndDate: (endDate: DateType | undefined) => void;

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

    onlyFavorites: undefined,
    setOFavorites(isIncludeFavorites) {
        set({ onlyFavorites: isIncludeFavorites });
    },

    isIncludeArchived: undefined,
    setIncludeArchived(isIncludeArchived) {
        set({ isIncludeArchived });
    },

    startDate: null,
    setStartDate(startDate) {
        set({ startDate: startDate ? new Date(startDate) : null });
    },

    endDate: null,
    setEndDate(endDate) {
        set({ endDate: endDate ? new Date(endDate) : null });
    },

    formattedFilters: undefined,
    setFormmatedFilters(formattedFilters) {
        set({ formattedFilters });
    }

}));

export default useGooglePhotosFilter;