import { ChangeEvent, FunctionComponent, useMemo } from "react";

import classNames from "../utils/classNames";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

interface GooglePhotosFeatureFilterProps {
  isDisabled: boolean;
}

const GooglePhotosFeatureFilter: FunctionComponent<
  GooglePhotosFeatureFilterProps
> = ({ isDisabled }) => {
  const onlyFavorites = useGooglePhotosFilter((s) => s.onlyFavorites);
  const setIncludeFavorites = useGooglePhotosFilter((s) => s.setOFavorites);

  const includeArchived = useGooglePhotosFilter((s) => s.isIncludeArchived);
  const setIncludeArchived = useGooglePhotosFilter((s) => s.setIncludeArchived);

  const inputs = useMemo(() => {
    return [
      {
        id: "include-favorites",
        label: "Only favorites",
        checked: onlyFavorites,
        onChange: (e: ChangeEvent<HTMLInputElement>) =>
          setIncludeFavorites(e.target.checked),
      },
      {
        id: "include-archived",
        label: "Include archived",
        checked: includeArchived,
        onChange: (e: ChangeEvent<HTMLInputElement>) =>
          setIncludeArchived(e.target.checked),
      },
    ];
  }, [includeArchived, onlyFavorites, setIncludeArchived, setIncludeFavorites]);

  return (
    <div className="space-y-1">
      {inputs.map((input) => (
        <div
          key={input.id}
          className={classNames(
            "flex items-center",
            isDisabled ? "cursor-not-allowed" : "cursor-auto"
          )}
        >
          <input
            type="checkbox"
            disabled={isDisabled}
            id={input.id}
            checked={input.checked}
            onChange={input.onChange}
            className="form-checkbox h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
          />
          <label
            htmlFor={input.id}
            className={classNames(
              "ml-2 block text-sm text-gray-900 select-none",
              isDisabled
                ? "opacity-70 cursor-not-allowed"
                : "opacity-100 cursor-auto"
            )}
          >
            {input.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default GooglePhotosFeatureFilter;
