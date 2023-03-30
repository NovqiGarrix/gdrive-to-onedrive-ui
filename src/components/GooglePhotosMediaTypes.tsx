import { Fragment, FunctionComponent } from "react";

import toast from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";

import googlephotosApi from "../apis/googlephotos.api";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import LoadingIcon from "./LoadingIcon";
import CheckboxWithSearch from "./CheckboxWithSearch";

const GooglePhotosMediaTypes: FunctionComponent = () => {
  const { data, isLoading, isError, error } = useQuery<
    Array<string>,
    HttpErrorExeption
  >({
    queryKey: ["google_photos_media_types"],
    queryFn: googlephotosApi.getMediaTypes,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    keepPreviousData: true,
    refetchOnWindowFocus: process.env.NODE_ENV === "production",

    onError(err) {
      toast.error(`Failed to get media types: ${err.message}`);
    },
  });

  const selectedData = useGooglePhotosFilter((s) => s.mediaTypeFilter, shallow);
  const addSelectedData = useGooglePhotosFilter(
    (s) => s.addMediaTypeFilter,
    shallow
  );
  const removeSelectedData = useGooglePhotosFilter(
    (s) => s.removeMediaTypeFilter
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
          selectedData={selectedData}
          inputPlaceholder="Media Types"
          addSelectedData={addSelectedData}
          removeSelectedData={removeSelectedData}
        />
      )}
    </Fragment>
  );
};

export default GooglePhotosMediaTypes;
