import {
  DragEvent,
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
  // @ts-ignore - No types
  experimental_useEffectEvent as useEffectEvent,
  useMemo,
} from "react";

import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  GetFilesFuncParams,
  GetFilesReturn,
  Provider,
  ProviderObject,
  TranferFileSchema,
} from "../types";
import { PROVIDERS } from "../constants";
import signInWithRedirectUrl from "../utils/signInWithRedirectUrl";
import type { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useSearchQuery from "../hooks/useSearchQuery";
import useProviderPath from "../hooks/useProviderPath";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";
import useDeleteFilesModalState from "../hooks/useDeleteFilesModalState";

import authApi from "../apis/auth.api";
import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";
import googlephotosApi from "../apis/googlephotos.api";

import File from "./File";
import Search from "./Search";
import Folders from "./Folders";
import LoadingIcon from "./LoadingIcon";
import Breadcrumbs from "./Breadcrumbs";
import SelectProvider from "./SelectProvider";
import GooglePhotosFilter from "./GooglePhotosFilter";

interface IFilesContainerProps {
  provider: string;
}

const FilesContainer: FunctionComponent<IFilesContainerProps> = (props) => {
  const { provider: _providerId } = props;

  const router = useRouter();

  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFiles = useSelectedFiles((s) => s.files);
  const openModalFunc = useDeleteFilesModalState((s) => s.openModal);

  const providerPath = useProviderPath((s) => s.path);
  const setProviderPath = useProviderPath((s) => s.setPath);

  const [provider, setProvider] = useState(
    PROVIDERS.find((p) => p.id === _providerId) || PROVIDERS[0]
  );

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

  const [authUrl, setAuthUrl] = useState("");
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
      if (err.message === "Unauthorized") {
        if (provider.id === "onedrive") {
          const authURL = await authApi.getMicorosftAuthUrl();
          setAuthUrl(authURL);
        }

        return;
      }

      toast.error(err.message, { id: "switching-provider" });
    },
  });

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

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

  async function onDrop(event: DragEvent<HTMLDivElement>) {
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

  const [infiniteScrollLoadingRef, { rootRef: infiniteScrollScrollRef }] =
    useInfiniteScroll({
      loading: isGettingMoreData,
      hasNextPage: !!data.nextPageToken,
      onLoadMore: getMoreData,
      rootMargin: "0px 0px 1000px 0px",
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

  return <div ref={containerRef}></div>;
};

export default FilesContainer;
