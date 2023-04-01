import {
  DragEvent,
  FunctionComponent,
  useEffect,
  useRef,
  // @ts-ignore - No types
  experimental_useEffectEvent as useEffectEvent,
  useMemo,
} from "react";

import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PROVIDERS } from "../constants";
import type { Provider, TranferFileSchema } from "../types";

import useGetFiles from "../hooks/useGetFiles";
import useSearchQuery from "../hooks/useSearchQuery";
import useProviderPath from "../hooks/useProviderPath";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useCloudProvider from "../hooks/useCloudProvider";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";
import useDeleteFilesModalState from "../hooks/useDeleteFilesModalState";

import onedriveApi from "../apis/onedrive.api";

import File from "./File";
import useGetFilesFunc from "./useGetFilesFunc";
import FileSkeletonLoading from "./FileSkeletonLoading";
import BeautifulError from "./BeautifulError";
import FileOptions from "./FileOptions";

const FilesContainer: FunctionComponent = () => {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFiles = useSelectedFiles((s) => s.files, shallow);
  const openModalFunc = useDeleteFilesModalState((s) => s.openModal);

  const providerPath = useProviderPath((s) => s.path);
  const provider = useCloudProvider((s) => s.provider);

  const debounceQuery = useSearchQuery((s) => s.debounceQuery);
  const googlePhotosFilters = useGooglePhotosFilter(
    (s) => s.formattedFilters,
    shallow
  );

  const getFiles = useGetFilesFunc();
  const { isLoading, isError, data, setData, error } = useGetFiles();

  const setShowUploadInfoProgress = useUploadInfoProgress((s) => s.setShow);
  const addUploadInfoProgress = useUploadInfoProgress(
    (s) => s.addUploadInfoProgress
  );
  const updateUploadInfoProgress = useUploadInfoProgress(
    (s) => s.updateUploadInfoProgress
  );

  async function transferFileFunc(
    file: TranferFileSchema,
    providerTarget: Provider,
    signal: AbortSignal
  ) {
    function onUploadProgress(progress: number) {
      const uploadInfoProgress =
        useUploadInfoProgress.getState().uploadInfoProgress;
      const f = uploadInfoProgress.find((f) => f.id === file.id);
      if (!f) return;

      updateUploadInfoProgress({ ...f, uploadProgress: progress });
    }

    function onDownloadProgress(progress: number) {
      const uploadInfoProgress =
        useUploadInfoProgress.getState().uploadInfoProgress;
      const f = uploadInfoProgress.find((f) => f.id === file.id);
      if (!f) return;

      updateUploadInfoProgress({ ...f, downloadProgress: progress });
    }

    function onInfoChange(info: string) {
      const uploadInfoProgress =
        useUploadInfoProgress.getState().uploadInfoProgress;
      const f = uploadInfoProgress.find((f) => f.id === file.id);
      if (!f) return;

      updateUploadInfoProgress({ ...f, info });
    }

    switch (providerTarget) {
      case "onedrive":
        return onedriveApi.transferFile({
          file,
          signal,
          onInfoChange,
          onUploadProgress,
          onDownloadProgress,
        });

      default:
        throw new Error("Invalid Provider!");
    }
  }

  async function transferFile(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const randomId = Math.random().toString(36).substring(7);
    const transferFileToastId = `transfer-files-${randomId}`;

    try {
      const selectedFiles: Array<TranferFileSchema> = JSON.parse(
        event.dataTransfer.getData("text/plain")
      );

      if (!selectedFiles.length) return;
      if (selectedFiles[0].providerId === provider.id) return;

      // Get the provider target
      // TODO: Make it dynamic
      const providerTarget = PROVIDERS[1];

      if (!providerTarget) {
        toast.error(
          "Invalid Provider. Please choose one of the providers first.",
          { id: transferFileToastId }
        );
        return;
      }

      // Initiate upload info progress
      const selectedFilesWithAbortController = selectedFiles.map((file) => {
        const abortController = new AbortController();

        const requiredParams = {
          ...file,
          abortController,
          isLoading: true,
          uploadProgress: 0,
          downloadProgress: 0,
          info: "Preparing your file",
        };

        const isExist = useUploadInfoProgress
          .getState()
          .uploadInfoProgress.find((f) => f.id === file.id);
        if (isExist) {
          updateUploadInfoProgress(requiredParams);
        } else {
          addUploadInfoProgress(requiredParams);
        }

        return {
          ...file,
          abortController,
        };
      });

      toast.loading(
        `Transferring ${selectedFilesWithAbortController.length} to ${providerTarget.name}`,
        {
          duration: 3000,
          id: transferFileToastId,
        }
      );

      // Show upload info progress,
      setShowUploadInfoProgress(true);

      const uploadedFiles = (
        await Promise.all(
          selectedFilesWithAbortController.map(async (file) => {
            try {
              await transferFileFunc(
                { ...file, path: providerPath },
                providerTarget.id,
                file.abortController.signal
              );

              updateUploadInfoProgress({
                id: file.id,
                isLoading: false,
              });

              await queryClient.invalidateQueries(
                [
                  "files",
                  provider.id,
                  debounceQuery,
                  providerPath,
                  provider.id === "google_photos"
                    ? JSON.stringify(googlePhotosFilters)
                    : undefined,
                ].filter(Boolean)
              );

              return true;
            } catch (error: any) {
              if (error.message === "cancelled") {
                toast.success(`${file.name}: Transfer cancelled!`, {
                  id: transferFileToastId,
                });
              }

              updateUploadInfoProgress({
                id: file.id,
                isLoading: false,
                error: error.message,
              });
            }
          })
        )
      ).filter(Boolean);

      const isAllError =
        useUploadInfoProgress
          .getState()
          .uploadInfoProgress.filter((info) => info.error).length ===
        selectedFilesWithAbortController.length;

      if (isAllError) {
        toast.error(`Transfer failed`, {
          id: transferFileToastId,
        });
      }

      if (uploadedFiles.length) {
        toast.success(
          `Transferred ${uploadedFiles.length} to ${providerTarget.name}`,
          {
            id: transferFileToastId,
          }
        );
      }
    } catch (error: any) {
      toast.error(error.message, {
        id: transferFileToastId,
      });
    }
  }

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
    return debounceQuery
      ? data.files
      : data.files.filter((f) => f.type === "file");
  }, [data.files, debounceQuery]);

  const openModal = useEffectEvent((params: any) => {
    openModalFunc(params);
  });

  useEffect(() => {
    if (!selectedFiles.length || !containerRef.current) return;

    const containerEl = containerRef.current;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === "Delete") {
        openModal({
          debounceQuery,
          path: providerPath,
          providerId: provider.id,
        });
      }
    };

    containerEl.addEventListener("keydown", handleKeydown);

    return () => {
      containerEl.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles.length]);

  return (
    <div ref={containerRef} className="w-full relative">
      <FileOptions />
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
          <div className="grid grid-cols-4 gap-5 mt-[30px]">
            {files.map((file) => (
              <File key={file.id} file={file} files={data.files} />
            ))}
            {/* End of element. Use for infinite scrolling */}
            {/* TODO: Uncomment this */}
            {/* <div ref={infiniteScrollLoadingRef}></div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesContainer;
