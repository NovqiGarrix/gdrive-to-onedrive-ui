import {
  Dispatch,
  DragEvent,
  FunctionComponent,
  SetStateAction,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import Image from "next/legacy/image";

import {
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";
import googlephotosApi from "../apis/googlephotos.api";

import useGetFiles from "../hooks/useGetFiles";
import useProviderPath from "../hooks/useProviderPath";
import useCloudProvider from "../hooks/useCloudProvider";

import classNames from "../utils/classNames";
import getIconExtensionUrl from "../utils/getIconExtensionUrl";

import type { IUploadFileParams, OnUploadProgress } from "../types";

import LoadingIcon from "./LoadingIcon";

interface IUploadFileObject {
  id: string;

  size: number;
  filename: string;
  progress: number;
  isLoading: boolean;
  abortController: AbortController;
  upload: () => Promise<void>;

  error?: string;
}

interface IUploadFuncUtilParams {
  file: File;
  id: string;
  signal: AbortSignal;
  onUploadProgress: OnUploadProgress;
}

const UploadArea: FunctionComponent = () => {
  const queryClient = useQueryClient();

  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<Array<IUploadFileObject>>([]);

  const providerPath = useProviderPath((s) => s.path);
  const providerId = useCloudProvider((s) => s.provider.id);

  const { queryKey: getFilesQueryKey } = useGetFiles();
  const [animationParenntRef] = useAutoAnimate({ duration: 200 });

  const [isClearingUploadedFiles, setIsClearingUploadedFiles] = useState(false);
  const isStillLoading = useMemo(
    () => files.filter((f) => f.isLoading).length > 0,
    [files]
  );

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragOver(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragOver(false);
  }

  async function clearUploadedFiles() {
    setIsClearingUploadedFiles(true);

    // Let's give some delay for each file to be removed
    // so that the user can see the animation
    const delay = 300;

    for await (const file of files) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setFiles((prev) => prev.filter((f) => f.id !== file.id));
          resolve();
        }, delay);
      });
    }

    setIsClearingUploadedFiles(false);
  }

  const uploadFunc = useCallback(
    (params: IUploadFileParams) => {
      switch (providerId) {
        case "google_drive":
          return googledriveApi.uploadFile(params);

        case "google_photos":
          return googlephotosApi.uploadFile(params);

        case "onedrive":
          return onedriveApi.uploadFile(params);

        default:
          throw new Error("Unsupported provider");
      }
    },
    [providerId]
  );

  async function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files);

    const uploadFuncUtil = async (params: IUploadFuncUtilParams) => {
      const { file, id, onUploadProgress, signal } = params;

      try {
        await uploadFunc({
          file,
          onUploadProgress,
          signal,
          path: providerPath,
        });

        setFiles((prev) =>
          prev.map((prevFile) =>
            prevFile.id === id ? { ...prevFile, isLoading: false } : prevFile
          )
        );

        await queryClient.refetchQueries(getFilesQueryKey);
      } catch (error: any) {
        setFiles((prev) =>
          prev.map((prevFile) =>
            prevFile.id === id
              ? { ...prevFile, error: error.message, isLoading: false }
              : prevFile
          )
        );
      }
    };

    const files = droppedFiles.map((f) => {
      const file: IUploadFileObject = {
        id: Math.random().toString(36).slice(0, 20),

        progress: 0,
        size: f.size,
        filename: f.name,
        isLoading: true,
        abortController: new AbortController(),
        upload: () =>
          uploadFuncUtil({
            onUploadProgress,

            file: f,
            id: file.id,
            signal: file.abortController.signal,
          }),
      };

      setFiles((prev) => [...prev, file]);

      const onUploadProgress: OnUploadProgress = (progress) => {
        setFiles((prev) =>
          prev.map((prevFile) =>
            prevFile.id === file.id ? { ...prevFile, progress } : prevFile
          )
        );
      };

      return {
        id: file.id,
        upload: file.upload,
      };
    });

    try {
      if (providerId === "google_photos") {
        // Google Photos does not support simultaneous uploads
        for await (const { upload, id } of files) {
          try {
            await upload();
          } catch (error: any) {
            // Set the error message, and set isLoading to false
            setFiles((prev) =>
              prev.map((prevFile) =>
                prevFile.id === id
                  ? { ...prevFile, error: error.message, isLoading: false }
                  : prevFile
              )
            );
          }
        }
      } else {
        await Promise.all(
          files.map(async ({ upload, id }) => {
            try {
              await upload();
            } catch (error: any) {
              // Set the error message, and set isLoading to false
              setFiles((prev) =>
                prev.map((prevFile) =>
                  prevFile.id === id
                    ? { ...prevFile, error: error.message, isLoading: false }
                    : prevFile
                )
              );
            }
          })
        );
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <section className="w-full mt-[50px]">
      <h2 className="font-medium font-inter text-2xl">Upload Files</h2>
      {/* Droparea */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className="mt-[30px] h-[250px] bg-[#F5F8FC] border border-dashed border-primary rounded-[10px] flex items-center justify-center flex-col"
      >
        <div className="p-2 rounded-full bg-youngPrimary">
          {isDragOver ? (
            <LoadingIcon className="w-5 h-5" fill="#2F80ED" />
          ) : (
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_2_353)">
                <path
                  d="M16.6667 16.6667L12.5 12.5L8.33337 16.6667"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.5 12.5V21.875"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.2396 19.1563C22.2556 18.6024 23.0582 17.7259 23.5207 16.6652C23.9833 15.6046 24.0794 14.42 23.794 13.2986C23.5086 12.1772 22.8578 11.1828 21.9445 10.4723C21.0311 9.76186 19.9072 9.37577 18.75 9.375H17.4375C17.1222 8.15546 16.5346 7.02327 15.7187 6.06354C14.9029 5.10381 13.8801 4.34151 12.7272 3.83397C11.5743 3.32642 10.3214 3.08684 9.06264 3.13321C7.80386 3.17959 6.57196 3.51073 5.45958 4.10174C4.34719 4.69274 3.38326 5.52824 2.64025 6.5454C1.89724 7.56257 1.39449 8.73494 1.16979 9.97437C0.945092 11.2138 1.0043 12.4881 1.34295 13.7013C1.6816 14.9146 2.2909 16.0353 3.12502 16.9792"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6667 16.6667L12.5 12.5L8.33337 16.6667"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_2_353">
                  <rect width="25" height="25" fill="white" />
                </clipPath>
              </defs>
            </svg>
          )}
        </div>

        <h5 className="mt-[23px] font-inter font-medium text-base">
          Drag and drop files, or{" "}
          <label
            htmlFor="upload-file-input"
            className="text-primary cursor-pointer"
          >
            Browse
          </label>
        </h5>
        <input
          type="file"
          id="upload-file-input"
          className="w-0 h-0 invisible -z-50"
        />
        <p className="font-medium mt-2 text-sm text-fontGray">
          Support zip, rar and even folder
        </p>
      </div>

      <div className="bg-white mt-5 py-3 pr-2">
        {/* Upload Progress */}
        <div ref={animationParenntRef} className="space-y-2">
          {files.map((file) => (
            <IndividualUploadInfoProgress
              file={file}
              key={file.id}
              setFiles={setFiles}
            />
          ))}
        </div>

        {files.length > 0 ? (
          <button
            type="button"
            onClick={clearUploadedFiles}
            disabled={isStillLoading || isClearingUploadedFiles}
            className="mt-3 w-full text-white text-sm py-3 rounded-lg bg-primary/90 hover:bg-primary focus:bg-primary focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-primary"
          >
            Clear All
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default UploadArea;

interface IIndividualUploadInfoProgressProps {
  file: IUploadFileObject;
  setFiles: Dispatch<SetStateAction<IUploadFileObject[]>>;
}

const IndividualUploadInfoProgress = memo<IIndividualUploadInfoProgressProps>(
  function IndividualUploadInfoProgress(props) {
    const { file, setFiles } = props;

    const isError = !!file.error;
    const isLoading = file.isLoading;
    const isDone = !isLoading && !isError;

    const iconLink = useMemo(() => {
      return getIconExtensionUrl(file.filename);
    }, [file.filename]);

    function cancelUpload() {
      file.abortController.abort("User canceled upload");
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    }

    async function retryUpload() {
      try {
        setFiles((prev) =>
          prev.map((prevFile) =>
            prevFile.id === file.id
              ? {
                  ...prevFile,
                  isLoading: true,
                  error: undefined,
                  progress: 0,
                }
              : prevFile
          )
        );

        await file.upload();
      } catch (error) {}
    }

    return (
      <div className="flex justify-between border rounded-[10px] p-3 space-x-5">
        <div
          className={classNames(
            "flex w-full overflow-hidden",
            isError ? "items-start" : "items-center"
          )}
        >
          <Image
            width={35}
            height={35}
            loading="lazy"
            src={iconLink}
            objectFit="contain"
            alt={`${file.filename} icon`}
          />
          <div className="ml-2 -mt-1 w-full">
            <h3 className="text-gray-600 w-full font-inter font-medium text-base">
              {file.filename}
            </h3>

            {isError ? (
              <p className="text-red-500 font-medium text-xs">{file.error}</p>
            ) : (
              <div className="relative mt-1.5">
                <div
                  style={{ width: `${file.progress}%` }}
                  className="ring-1 absolute inset-0 z-10 ring-primary/70"
                ></div>
                <div className="ring-1 absolute inset-0 w-full ring-gray-200"></div>
              </div>
            )}
          </div>
        </div>

        {/* Percentage, Loading Icon, and Cancel button */}
        <div className="flex items-center space-x-3 pr-1 flex-shrink-0">
          {isLoading ? (
            <span className="font-inter font-medium text-xs text-gray-500">
              {file.progress}%
            </span>
          ) : null}

          {isDone ? (
            <CheckCircleIcon
              aria-hidden="true"
              className="w-6 h-6 -mr-0.5 text-green-500"
            />
          ) : !isError ? (
            <LoadingIcon className="w-5 h-5" fill="#2F80ED" />
          ) : null}

          {file.isLoading ? (
            <button type="button" onClick={cancelUpload}>
              <XMarkIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />
            </button>
          ) : isError ? (
            <button type="button" className="group" onClick={retryUpload}>
              <ArrowPathIcon
                aria-hidden="true"
                className="w-5 h-5 text-gray-500 group-hover:text-primary"
              />
            </button>
          ) : null}
        </div>
      </div>
    );
  }
);
