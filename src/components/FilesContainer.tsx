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

import Link from "next/link";
import { toast } from "react-hot-toast";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PROVIDERS } from "../constants";
import classNames from "../utils/classNames";
import type {
  GetFilesFuncParams,
  GetFilesReturn,
  GooglePhotosFilter as IGooglePhotosFilter,
  Provider,
  ProviderObject,
  TranferFileSchema,
} from "../types";
import type { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useSearchQuery from "../hooks/useSearchQuery";
import useUsedProviders from "../hooks/useUsedProviders";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";
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
}

const FilesContainer: FunctionComponent<IFilesContainerProps> = (props) => {
  const { provider: _providerId } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const selectedFiles = useSelectedFiles((s) => s.files);
  const openModalFunc = useDeleteFilesModalState((s) => s.openModal);

  const hasProvider = useUsedProviders((state) => state.has);
  const getProviders = useUsedProviders((state) => state.getProviders);
  const replaceProvider = useUsedProviders((state) => state.replaceProvider);

  const [provider, setProvider] = useState(
    PROVIDERS.find((p) => p.id === _providerId) || PROVIDERS[0]
  );

  const previousProvider = useRef<ProviderObject>(provider);
  const [path, setPath] = useState<undefined | string>(undefined);

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
    refetchOnMount: false,
    refetchOnWindowFocus: process.env.NODE_ENV === "production",

    onSuccess(data) {
      setData(data);
      if (provider.id !== previousProvider.current.id) {
        previousProvider.current = provider;
        toast.success(`Switched to ${provider.name}`);
      }
    },

    async onError(err) {
      if (err.message === "Unauthorized") {
        if (provider.id === "onedrive") {
          const authURL = await authApi.getMicorosftAuthUrl();
          setAuthUrl(authURL);
        }
      }
    },
  });

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const tranferFileFunc = useCallback(
    (file: TranferFileSchema, providerTarget: Provider) => {
      switch (providerTarget) {
        case "onedrive":
          return onedriveApi.transferFile(file);

        default:
          throw new Error("Invalid Provider!");
      }
    },
    []
  );

  async function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    try {
      const selectedFiles = JSON.parse(
        event.dataTransfer.getData("text/plain")
      );

      if (!selectedFiles.length) return;
      if (selectedFiles[0].providerId === provider.id) return;

      const providerTarget = getProviders()
        .filter((provider) => provider.id !== selectedFiles[0].providerId)
        .at(0);

      if (!providerTarget) {
        toast.error(
          "Invalid Provider. Please choose one of the providers first."
        );
        return;
      }

      toast(
        `Transferring ${selectedFiles.length} files to ${providerTarget.name}`
      );
      for (const file of selectedFiles) {
        await tranferFileFunc({ ...file, path }, providerTarget.id);
      }

      setSearchQuery("");
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

      toast.success("File transfered successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Invalid data. Please try again.");
    }
  }

  async function getMoreDataFunc() {
    if (!data.nextPageToken) return;

    const nextFiles = await getFiles({
      query: debounceQuery,
      nextPageToken: data.nextPageToken,
      path,
      filters: googlePhotosFilters,
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

  function onChangeProvider(newProvider: ProviderObject) {
    if (newProvider.id === provider.id) return;

    if (hasProvider(newProvider)) {
      toast.error(
        "You have already added this provider. Please select another one."
      );
      return;
    }

    setProvider(newProvider);
    replaceProvider(provider, newProvider);

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
            <SelectProvider provider={provider} onChange={onChangeProvider} />

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
                <Link
                  href={authUrl}
                  className="btn btn-primary"
                  referrerPolicy="no-referrer"
                >
                  Sign In
                </Link>
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
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className={classNames("grid grid-cols-3 gap-3")}
                  >
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
  );
};

export default FilesContainer;
