import {
  Fragment,
  FunctionComponent,
  useEffect,
  // @ts-ignore - No types
  experimental_useEffectEvent as useEffectEvent,
  useMemo,
} from "react";

import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { useMutation } from "@tanstack/react-query";
import useInfiniteScroll from "react-infinite-scroll-hook";

import useGetFiles from "../hooks/useGetFiles";
import useSearchQuery from "../hooks/useSearchQuery";
import useProviderPath from "../hooks/useProviderPath";
import useGetFilesFunc from "../hooks/useGetFilesFunc";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useCloudProvider from "../hooks/useCloudProvider";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";
import useDeleteFilesModalState from "../hooks/useDeleteFilesModalState";

import File from "./File";
import FileOptions from "./FileOptions";
import BeautifulError from "./BeautifulError";
import UploadProgressInfo from "./UploadProgressInfo";
import FileSkeletonLoading from "./FileSkeletonLoading";

const FilesContainer: FunctionComponent = () => {
  const selectedFiles = useSelectedFiles((s) => s.files, shallow);
  const openModalFunc = useDeleteFilesModalState((s) => s.openModal);

  const providerPath = useProviderPath((s) => s.path);
  const providerId = useCloudProvider((s) => s.provider.id);

  const debounceQuery = useSearchQuery((s) => s.debounceQuery);
  const googlePhotosFilters = useGooglePhotosFilter(
    (s) => s.formattedFilters,
    shallow
  );

  const getFiles = useGetFilesFunc();
  const { isLoading, isError, data, setData, error } = useGetFiles();

  async function getMoreDataFunc() {
    if (!data.nextPageToken) return;

    const nextFiles = await getFiles({
      path: providerPath,
      query: debounceQuery,
      filters: googlePhotosFilters,
      nextPageToken: data.nextPageToken,
    });

    setData((prev) => ({
      ...prev,
      files: [...prev.files, ...nextFiles.files],
      nextPageToken: nextFiles.nextPageToken,
    }));
  }

  // Get More Data Mutation
  const {
    mutate: getMoreData,
    isLoading: isGettingMoreData,
    isError: isErrorGettingMoreData,
  } = useMutation({
    mutationKey: [
      "getMoreData",
      debounceQuery,
      data.nextPageToken,
      providerPath,
    ],
    mutationFn: getMoreDataFunc,

    onError() {
      toast.error("Failed to load more data.");
    },
  });

  const [infiniteScrollLoadingRef] = useInfiniteScroll({
    loading: isGettingMoreData,
    hasNextPage: !!data.nextPageToken,
    onLoadMore: getMoreData,
    rootMargin: "0px 0px 2000px 0px",
    disabled: isErrorGettingMoreData,
  });

  // Filter the files to only show files (not folders)
  const files = useMemo(() => {
    if (providerId === "onedrive") {
      return debounceQuery
        ? data.files
        : data.files.filter((f) => f.type === "file");
    }

    return data.files;
  }, [data.files, debounceQuery, providerId]);

  const openModal = useEffectEvent(() => {
    openModalFunc();
  });

  useEffect(() => {
    if (!selectedFiles.length) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === "Delete") {
        openModal();
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles.length]);

  return (
    <div className="w-full relative">
      <FileOptions />
      <UploadProgressInfo />
      <div className="w-full mt-[42px]">
        <h2 className="font-medium font-inter text-fontBlack2 text-2xl">
          Files
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-5 mt-[30px]">
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <FileSkeletonLoading key={i} />
              ))}
          </div>
        ) : isError ? (
          <BeautifulError.Root>
            <BeautifulError.Title title="Failed to load files" />
            <BeautifulError.Message message={error?.message!} />
          </BeautifulError.Root>
        ) : (
          <Fragment>
            {files.length > 0 ? (
              <div className="grid grid-cols-4 gap-5 mt-[30px]">
                {files.map((file) => (
                  <File key={file.id} file={file} files={data.files} />
                ))}
                {/* End of element. Use for infinite scrolling */}
                <div ref={infiniteScrollLoadingRef}></div>
              </div>
            ) : (
              <p className="text-base font-inter font-medium mt-2 text-gray-600">
                Your files should appear here
              </p>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default FilesContainer;
