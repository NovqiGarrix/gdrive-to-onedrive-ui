import {
  DragEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
  // @ts-ignore - No types
  experimental_useEffectEvent as useEffectEvent,
  useMemo,
} from "react";

import Link from "next/link";

import { toast } from "react-hot-toast";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EllipsisHorizontalIcon from "@heroicons/react/20/solid/EllipsisHorizontalIcon";

import type {
  GetFilesFuncParams,
  GetFilesReturn,
  Provider,
  ProviderObject,
  TranferFileSchema,
} from "../types";
import { PROVIDERS } from "../constants";
import type { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useSearchQuery from "../hooks/useSearchQuery";
import useProviderPath from "../hooks/useProviderPath";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useCloudProvider from "../hooks/useCloudProvider";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";
import useDeleteFilesModalState from "../hooks/useDeleteFilesModalState";

import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";
import googlephotosApi from "../apis/googlephotos.api";
import Image from "next/legacy/image";
import getIconExtensionUrl from "../utils/getIconExtensionUrl";

interface IFilesContainerProps {
  provider: string;
}

const FilesContainer: FunctionComponent<IFilesContainerProps> = (props) => {
  const { provider: _providerId } = props;

  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFiles = useSelectedFiles((s) => s.files);
  const openModalFunc = useDeleteFilesModalState((s) => s.openModal);

  const providerPath = useProviderPath((s) => s.path);
  const provider = useCloudProvider((s) => s.provider);

  const previousProvider = useRef<ProviderObject>(provider);
  const debounceQuery = useSearchQuery((s) => s.debounceQuery);
  const googlePhotosFilters = useGooglePhotosFilter((s) => s.formattedFilters);

  const getFiles = useCallback(
    (params: GetFilesFuncParams) => {
      const { query, nextPageToken, path, filters, foldersOnly } = params;

      switch (provider.id) {
        case "google_drive":
          return googledriveApi.getFiles({
            query,
            nextPageToken,
            foldersOnly,
            path,
          });

        case "google_photos":
          return googlephotosApi.getFiles(nextPageToken, filters);

        case "onedrive":
          return onedriveApi.getFiles({
            query,
            nextPageToken,
            path,
            foldersOnly,
          });

        default:
          throw new Error("Invalid Provider!");
      }
    },
    [provider.id]
  );

  const [data, setData] = useState<GetFilesReturn>({
    files: [],
    nextPageToken: undefined,
  });

  const setShowUploadInfoProgress = useUploadInfoProgress((s) => s.setShow);
  const addUploadInfoProgress = useUploadInfoProgress(
    (s) => s.addUploadInfoProgress
  );
  const updateUploadInfoProgress = useUploadInfoProgress(
    (s) => s.updateUploadInfoProgress
  );

  const { isLoading, isError, error } = useQuery<
    GetFilesReturn,
    HttpErrorExeption
  >({
    queryFn: () =>
      getFiles({
        query: debounceQuery,
        path: providerPath,
        filters: googlePhotosFilters,
      }),
    queryKey: [
      "files",
      provider.id,
      debounceQuery,
      providerPath,
      provider.id === "google_photos"
        ? JSON.stringify(googlePhotosFilters)
        : undefined,
    ].filter(Boolean),
    retry: false,
    keepPreviousData: true,
    refetchOnWindowFocus: process.env.NODE_ENV === "production",

    behavior: {
      onFetch() {
        if (provider.id !== previousProvider.current.id) {
          toast.loading(`Switching to ${provider.name}...`, {
            id: "switching-provider",
          });
        }
      },
    },

    onSuccess(data) {
      setData(data);
      if (provider.id !== previousProvider.current.id) {
        previousProvider.current = provider;
        toast.success(`Switched to ${provider.name}`, {
          id: "switching-provider",
        });
      }
    },

    async onError(err) {
      // if (err.message === "Unauthorized") {
      //   if (provider.id === "onedrive") {
      //     const authURL = await authApi.getMicorosftAuthUrl();
      //     setAuthUrl(authURL);
      //   }

      //   return;
      // }

      toast.error(err.message, { id: "switching-provider" });
    },
  });

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
    <div ref={containerRef} className="w-full">
      <div className="w-full mt-[42px]">
        <h2 className="font-medium font-inter text-fontBlack2 text-2xl">
          Files
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-5 mt-[30px]">
            {Array(7)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  {/* The Image Container */}
                  <div className="bg-[#F4F6F6] rounded-[10px] pt-[15px] px-[15px] h-[230px]"></div>

                  <div className="mt-[22px]">
                    {/* The filename and the options button */}
                    <div className="flex items-center justify-between">
                      <div className="w-10/12 h-2 rounded bg-gray-300/80"></div>
                      <EllipsisHorizontalIcon className="w-5 h-5 text-fontBlack flex-shrink-0" />
                    </div>

                    <p className="mt-4 w-1/2 h-2 rounded bg-gray-200"></p>
                  </div>
                </div>
              ))}
          </div>
        ) : isError ? (
          <div></div>
        ) : (
          <div className="grid grid-cols-4 gap-5 mt-[30px]">
            {files.map((file) => (
              <div key={file.id} className="mb-2">
                {/* The Image Container */}
                <div className="bg-[#F4F6F6] flex items-center justify-center rounded-[10px] pt-[15px] px-[15px] h-[230px] overflow-hidden">
                  {file.image ? (
                    // Do not cache the image in CDN (Privacy concern). That's why we don't use next/image
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={file.name}
                      loading="lazy"
                      src={file.image}
                      className="object-cover rounded-t-[10px] w-full h-full"
                    />
                  ) : (
                    <Image
                      src={getIconExtensionUrl(file.name, file.mimeType)}
                      alt={`${file.name} icon`}
                      width={50}
                      height={50}
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="mt-[22px]">
                  {/* The filename and the options button */}
                  <div className="flex items-center justify-between">
                    <Link
                      passHref
                      target="_blank"
                      href={file.webUrl}
                      referrerPolicy="no-referrer"
                      className="w-[85%] text-base font-medium font-inter text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {file.name}
                    </Link>
                    <button type="button">
                      <EllipsisHorizontalIcon
                        aria-hidden="true"
                        className="w-5 h-5 text-fontBlack flex-shrink-0"
                      />
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-medium text-[#8B9AB1]">
                    Uploaded 10m ago
                  </p>
                </div>
              </div>
            ))}
            {/* End of element. Use for infinite scrolling */}
            <div ref={infiniteScrollLoadingRef}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesContainer;
