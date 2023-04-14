import { Fragment, FunctionComponent } from "react";

import toast from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";

import googlephotosApi from "../apis/googlephotos.api";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import LoadingIcon from "./LoadingIcon";
import CheckboxWithSearch from "./CheckboxWithSearch";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

interface GooglePhotosContentCategoriesProps {
  isDisabled: boolean;
}

const GooglePhotosContentCategories: FunctionComponent<
  GooglePhotosContentCategoriesProps
> = ({ isDisabled }) => {
  const { data, isLoading, isError, error } = useQuery<
    Array<string>,
    HttpErrorExeption
  >({
    queryKey: ["google_photos_content_categories"],
    queryFn: googlephotosApi.getContentCategories,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    keepPreviousData: true,
    refetchOnWindowFocus: process.env.NODE_ENV === "production",

    onError(err) {
      toast.error(`Failed to get content categories: ${err.message}`);
    },
  });

  const selectedData = useGooglePhotosFilter((s) => s.contentFilter, shallow);
  const addSelectedData = useGooglePhotosFilter((s) => s.addContentFilter);
  const removeSelectedData = useGooglePhotosFilter(
    (s) => s.removeContentFilter
  );

  return (
    <Fragment>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <LoadingIcon className="w-5 h-5 text-darken" />
          <span className="text-sm text-darken">Getting Data...</span>
        </div>
      ) : isError ? (
        <div className="w-full">
          <span className="text-sm text-error font-medium">
            {error.message}
          </span>
        </div>
      ) : (
        <CheckboxWithSearch
          data={data}
          isDisabled={isDisabled}
          selectedData={selectedData}
          addSelectedData={addSelectedData}
          inputPlaceholder="Content Categories"
          removeSelectedData={removeSelectedData}
        />
      )}
    </Fragment>
  );
};

export default GooglePhotosContentCategories;
