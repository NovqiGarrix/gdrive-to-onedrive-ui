import { FunctionComponent } from "react";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

const GooglePhotosFeatureFilter: FunctionComponent = () => {
  const onlyFavorites = useGooglePhotosFilter((s) => s.onlyFavorites);
  const setIncludeFavorites = useGooglePhotosFilter((s) => s.setOFavorites);

  const includeArchived = useGooglePhotosFilter((s) => s.isIncludeArchived);
  const setIncludeArchived = useGooglePhotosFilter((s) => s.setIncludeArchived);

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="include-favorites"
          checked={onlyFavorites}
          onChange={(e) => setIncludeFavorites(e.target.checked)}
          className="form-checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
        <label
          htmlFor="include-favorites"
          className="ml-2 block text-sm text-gray-900 select-none"
        >
          Only Favorites
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="include-archived"
          checked={includeArchived}
          onChange={(e) => setIncludeArchived(e.target.checked)}
          className="form-checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
        <label
          htmlFor="include-archived"
          className="ml-2 block text-sm text-gray-900 select-none"
        >
          Include Archived
        </label>
      </div>
    </div>
  );
};

export default GooglePhotosFeatureFilter;
