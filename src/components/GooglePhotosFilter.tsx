import type { FunctionComponent } from "react";
import { shallow } from "zustand/shallow";

import useGetFiles from "../hooks/useGetFiles";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

import LoadingIcon from "./LoadingIcon";
import GooglePhotosMediaTypes from "./GooglePhotosMediaTypes";
import GooglePhotosDateRanges from "./GooglePhotosDateRanges";
import GooglePhotosFeatureFilter from "./GooglePhotosFeatureFilter";
import GooglePhotosContentCategories from "./GooglePhotosContentCategories";

const GooglePhotosFilter: FunctionComponent = () => {
  // I guest the loading is not coming from here
  const { isFetching } = useGetFiles();

  const includeArchivedMedia = useGooglePhotosFilter(
    (s) => s.isIncludeArchived
  );
  const endDate = useGooglePhotosFilter((s) => s.endDate, shallow);
  const startDate = useGooglePhotosFilter((s) => s.startDate, shallow);
  const mediaTypes = useGooglePhotosFilter((s) => s.mediaTypeFilter, shallow);
  const contentCategories = useGooglePhotosFilter(
    (s) => s.contentFilter,
    shallow
  );
  const onlyFavorites = useGooglePhotosFilter((s) => s.onlyFavorites);

  const googlePhotosFilters = useGooglePhotosFilter(
    (s) => s.formattedFilters,
    shallow
  );
  const setFormmatedFilters = useGooglePhotosFilter(
    (s) => s.setFormmatedFilters
  );

  const isLoading = Boolean(isFetching && googlePhotosFilters);

  function onSubmit() {
    setFormmatedFilters({
      contentCategories,
      dateRanges: {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
      mediaTypes,
      includeArchivedMedia,
      onlyFavorites,
    });
  }

  return (
    <div className="grid grid-cols-3 gap-3 items-center w-full">
      {/* Content Categories */}
      <GooglePhotosContentCategories />

      {/* Media Types */}
      <GooglePhotosMediaTypes />

      {/* Feature Filter */}
      <GooglePhotosFeatureFilter />

      {/* Date Ranges */}
      <GooglePhotosDateRanges />

      {/* Submit Button */}
      <button
        type="button"
        disabled={isFetching}
        onClick={onSubmit}
        className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <LoadingIcon fill="#fff" className="w-5 h-5" />
        ) : (
          <p>Filter</p>
        )}
      </button>
    </div>
  );
};

export default GooglePhotosFilter;
