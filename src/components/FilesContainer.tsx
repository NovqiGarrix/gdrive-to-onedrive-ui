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
import useProviderPaths from "../hooks/useProviderPath";
import useUsedProviders from "../hooks/useUsedProviders";
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
import ProviderLogout from "./ProviderLogout";
import SelectProvider from "./SelectProvider";
import GooglePhotosFilter from "./GooglePhotosFilter";

interface IFilesContainerProps {
  provider: string;
  componentIndex: number;
}

const FilesContainer: FunctionComponent<IFilesContainerProps> = (props) => {
  const { provider: _providerId, componentIndex } = props;

  const router = useRouter();
  const pKey = `p${componentIndex + 1}` as "p1" | "p2";

  const path = useProviderPaths((s) => s[pKey]);
  const _setPath = useProviderPaths((s) => {
    const setter = s[`set${pKey.toUpperCase()}` as "setP1" | "setP2"];
    return setter;
  });

  const setPath = useCallback(
    (path: string | undefined) => {
      _setPath(path);

      if (!path) {
        delete router.query[`${pKey}_path`];
      }

      router.push(
        {
          pathname: "/",
          query: {
            ...router.query,
            ...(path ? { [`${pKey}_path`]: path } : {}),
          },
        },
        undefined,
        { shallow: true }
      );
    },
    [_setPath, pKey, router]
  );

  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFiles = useSelectedFiles((s) => s.files);
  const openModalFunc = useDeleteFilesModalState((s) => s.openModal);

  const hasProvider = useUsedProviders((state) => state.has);
  const usedProviders = useUsedProviders((state) =>
    Array.from(state.usedProviders)
  );
  const replaceProvider = useUsedProviders((state) => state.replaceProvider);

  const [provider, setProvider] = useState(
    PROVIDERS.find((p) => p.id === _providerId) || PROVIDERS[0]
  );

  const previousProvider = useRef<ProviderObject>(provider);
  const { debounceQuery, searchQuery, setSearchQuery } = useSearchQuery();
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
      getFiles({ query: debounceQuery, path, filters: googlePhotosFilters }),
    queryKey: [
      "files",
      provider.id,
      debounceQuery,
      path,
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
      const providerTarget = usedProviders
        .filter((provider) => provider.id !== selectedFiles[0].providerId)
        .at(0);

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
                { ...file, path },
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
                  path,
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
      path,
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
    mutationKey: ["getMoreData", debounceQuery, data.nextPageToken, path],
    mutationFn: getMoreDataFunc,

    onError() {
      toast.error("Failed to load more data.");
    },
  });

  function onProviderChange(newProvider: ProviderObject) {
    if (newProvider.id === provider.id) return;

    if (hasProvider(newProvider)) {
      toast.error(
        "You have already select this provider. Please select another one."
      );
      return;
    }

    setProvider(newProvider);
    replaceProvider(provider, newProvider);

    const query = new URLSearchParams(router.query as Record<string, string>);

    const queryName = `p${componentIndex + 1}`;

    query.set(
      queryName,
      String(PROVIDERS.findIndex((po) => po.id === newProvider.id))
    );

    router.push(`/?${query.toString()}`, undefined, { shallow: true });
    setSearchQuery("");
  }

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
          path,
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
    <div ref={containerRef}>
      <div
        ref={infiniteScrollScrollRef}
        className="bg-white rounded-2xl lg:rounded-3xl h-full min-h-[80vh] max-h-[80vh] p-5 md:p-8 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col items-start justify-start">
          <div className="flex items-center justify-between w-full">
            <SelectProvider provider={provider} onChange={onProviderChange} />

            {/* Logout Component */}
            {!isError && !isLoading && provider.id === "onedrive" ? (
              <ProviderLogout
                path={path}
                providerId={provider.id}
                debounceQuery={debounceQuery}
              />
            ) : null}
          </div>

          <div className="w-full mt-3">
            {provider.id === "google_photos" ? (
              <GooglePhotosFilter
                isLoading={!!(isLoading && googlePhotosFilters)}
              />
            ) : (
              <Fragment>
                <Search
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
                <hr className="w-full bg-bg-2" />
              </Fragment>
            )}
          </div>
        </div>

        {!debounceQuery && !isError ? (
          <Breadcrumbs path={path} setPath={setPath} />
        ) : null}

        {debounceQuery ? (
          <div className="mt-5 mb-3">
            <p className="text-sm text-darken">
              Search results for `{debounceQuery}`
            </p>
          </div>
        ) : null}

        <div
          className="h-3/4"
          {...(componentIndex === 1 ? { onDrop } : {})}
          onDragOver={onDragOver}
        >
          {/* Files */}
          <Folders
            path={path}
            setPath={setPath}
            getFiles={getFiles}
            provider={provider}
            query={debounceQuery}
          />

          {/* Loading Component */}
          <div className="mt-5 h-full">
            {isLoading ? (
              <div className="grid grid-cols-3 gap-3 pb-5">
                {Array(9)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-indigo-50/60 hover:bg-indigo-100/50 rounded-lg focus:bg-indigo-100/90"
                    >
                      <div className="py-1 px-2 animate-pulse h-[200px] relative overflow-hidden focus:outline-none">
                        <div className="w-full flex items-center p-2">
                          <div className="w-5 h-5 rounded-full flex-shrink-0 mr-1.5 bg-gray-300"></div>
                          <div className="w-full h-2 rounded bg-gray-300"></div>
                        </div>

                        <div className="w-full h-[70%] mt-1.5 rounded mx-auto flex items-center justify-center">
                          <div className="w-36 h-36 rounded bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : isError ? (
              error?.message === "Unauthorized" ? (
                <div className="w-full h-[78%] flex flex-col items-center justify-center">
                  <button
                    role="link"
                    type="button"
                    onClick={() => signInWithRedirectUrl(authUrl)}
                    className="btn btn-primary"
                  >
                    Sign In
                  </button>
                  <span className="mt-3 font-medium">
                    Sign in to your Microsoft Account
                  </span>
                </div>
              ) : (
                <div className="text-red-500 mt-3">
                  <p>{error?.message}</p>
                </div>
              )
            ) : (
              <Fragment>
                <h2 className="text-dark font-medium mb-2">Files</h2>

                {(files.length || 0) > 0 ? (
                  <div className="mt-1">
                    <div className="grid grid-cols-3 gap-3 pb-5">
                      {data.files?.map((file) => (
                        <Fragment key={file.id}>
                          {file.type === "file" ? (
                            <File
                              file={file}
                              data={data.files}
                              providerId={provider.id}
                              selectedFiles={selectedFiles}
                            />
                          ) : null}
                        </Fragment>
                      ))}
                    </div>

                    <div ref={infiniteScrollLoadingRef}></div>

                    {isGettingMoreData ? (
                      <div className="max-w-full w-full flex items-center justify-center mt-5">
                        <LoadingIcon
                          width={30}
                          height={30}
                          className="text-darken"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-2">
                    <h3 className="text-sm text-gray-500">
                      Your files will appear here
                    </h3>
                  </div>
                )}
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesContainer;
