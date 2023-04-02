import {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
  // @ts-ignore - No types
  experimental_useEffectEvent as useEffectEvent,
} from "react";

import Link from "next/link";
import Image from "next/image";

import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { Popover, Transition } from "@headlessui/react";

import StarIcon from "@heroicons/react/24/outline/StarIcon";
import BoltIcon from "@heroicons/react/24/outline/BoltIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import PaperClipIcon from "@heroicons/react/24/outline/PaperClipIcon";
import ArrowDownTrayIcon from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import ArrowSmallDownIcon from "@heroicons/react/24/outline/ArrowSmallDownIcon";

import type {
  Provider,
  ProviderObject,
  TransferFileSchema,
  UploadInfoProgress,
} from "../types";
import { PROVIDERS } from "../constants";
import classNames from "../utils/classNames";

import onedriveApi from "../apis/onedrive.api";
import googlephotosApi from "../apis/googlephotos.api";

import useGetFiles from "../hooks/useGetFiles";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useCloudProvider from "../hooks/useCloudProvider";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

const FileOptions: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: allFiles } = useGetFiles();

  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [isShowingOptions, setIsShowingOptions] = useState(false);

  const selectedFiles = useSelectedFiles((s) => s.files, shallow);
  const replaceAllSelectedFiles = useSelectedFiles((s) => s.replaceAllFiles);

  const provider = useCloudProvider((s) => s.provider, shallow);

  const otherActions = useMemo(() => {
    return [
      {
        Icon: PaperClipIcon,
        label: "Get Link",
        onClick: () => {},
      },
      {
        Icon: StarIcon,
        label: "Add to favorites",
        onClick: () => {},
      },
      {
        Icon: ArrowDownTrayIcon,
        label: "Download",
        onClick: () => {},
      },
      {
        Icon: TrashIcon,
        label: "Delete",
        onClick: () => {},
      },
    ];
  }, []);

  const targetUploadProviders = useMemo(
    () => PROVIDERS.filter((p) => p.id !== provider.id),
    [provider.id]
  );

  const setShowUploadInfoProgress = useUploadInfoProgress((s) => s.setShow);
  const addUploadInfoProgress = useUploadInfoProgress(
    (s) => s.addUploadInfoProgress
  );
  const updateUploadInfoProgress = useUploadInfoProgress(
    (s) => s.updateUploadInfoProgress
  );

  async function transferFileFunc(
    file: TransferFileSchema,
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

    const params = {
      file,
      signal,
      onUploadProgress,
      onDownloadProgress,
      providerId: provider.id,
    };

    switch (providerTarget) {
      case "onedrive": {
        return onedriveApi.transferFile(params);
      }

      case "google_photos": {
        return googlephotosApi.transferFile(params);
      }

      default:
        throw new Error("Unsupported Provider!");
    }
  }

  async function upload(
    file: Omit<UploadInfoProgress, "upload">,
    providerTarget: ProviderObject,
    transferFileToastId: string
  ) {
    try {
      await transferFileFunc(
        file,
        providerTarget.id,
        file.abortController.signal
      );

      updateUploadInfoProgress({
        id: file.id,
        isLoading: false,
      });
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

      return false;
    }
  }

  async function transferFile(providerTarget: ProviderObject) {
    setIsShowingOptions(false);

    const transferFileToastId = `transfer-files-${Math.random()
      .toString(36)
      .substring(7)}`;

    try {
      // Initiate upload info progress
      const selectedFilesWithAbortController = selectedFiles.map((file) => {
        const abortController = new AbortController();

        const requiredParams: UploadInfoProgress = {
          ...file,
          abortController,
          isLoading: true,
          uploadProgress: 0,
          downloadProgress: 0,
          providerId: file.from,
          upload: () =>
            upload(requiredParams, providerTarget, transferFileToastId),
        };

        const isExist = useUploadInfoProgress
          .getState()
          .uploadInfoProgress.find((f) => f.id === file.id);
        if (isExist) {
          updateUploadInfoProgress(requiredParams);
        } else {
          addUploadInfoProgress(requiredParams);
        }

        return requiredParams;
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

      if (providerTarget.id === "google_photos") {
        // Google Photos only support upload one by one
        for await (const file of selectedFilesWithAbortController) {
          await file.upload();
        }
      } else {
        await Promise.all(
          selectedFilesWithAbortController.map((file) => file.upload())
        );
      }

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

      // if (uploadedFiles.length) {
      //   toast.success(
      //     `Transferred ${uploadedFiles.length} to ${providerTarget.name}`,
      //     {
      //       id: transferFileToastId,
      //     }
      //   );
      // }
    } catch (error: any) {
      toast.error(error.message, {
        id: transferFileToastId,
      });
    }
  }

  const getAndAddFile = useEffectEvent((fileIdFromAttribute: string) => {
    if (selectedFiles.find((f) => f.id === fileIdFromAttribute)) return true;

    const fileFromId = allFiles.files.find(
      (file) => file.id === fileIdFromAttribute
    );

    if (!fileFromId) return false;

    replaceAllSelectedFiles(fileFromId);
    return true;
  });

  useEffect(() => {
    function isOutsideWindow(
      event: MouseEvent,
      newCoord: { x: number; y: number }
    ) {
      if (!ref.current) return;
      const { x, y } = newCoord;
      const { innerWidth, innerHeight } = window;

      const right = x + ref.current.clientWidth;
      const bottom = y + ref.current.clientHeight;

      const isOutside =
        event.target !== ref.current &&
        (x < 0 || y < 0 || right > innerWidth || bottom > innerHeight);

      return {
        isOutside,
        top: y,
        left: x,
        right,
        bottom,
      };
    }

    function handleMouseDown(event: MouseEvent) {
      // @ts-ignore - No types
      const fileIdFromAttribute: string = event.target.getAttribute("data-id");
      if (!fileIdFromAttribute) {
        if (ref.current && ref.current.contains(event.target as Node)) return;

        setIsShowingOptions(false);
        return;
      }

      // Left click
      if (event.button !== 2) {
        setIsShowingOptions(false);
        return;
      }

      if (!getAndAddFile(fileIdFromAttribute)) return;

      const newCoord = { x: event.clientX, y: event.clientY };

      const outsideWindow = isOutsideWindow(event, newCoord);
      if (outsideWindow?.isOutside) {
        if (!ref.current) return;

        if (outsideWindow.top < 0) {
          newCoord.y = 0;
        }

        if (outsideWindow.left < 0) {
          newCoord.x = 0;
        }

        if (outsideWindow.right > window.innerWidth) {
          newCoord.x = window.innerWidth - (ref.current.clientWidth + 50);
        }

        if (outsideWindow.bottom > window.innerHeight) {
          newCoord.y = window.innerHeight - ref.current.clientHeight;
        }
      }

      setCoord(newCoord);
      setIsShowingOptions(true);
    }

    function preventRightClickOptions(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
    }

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("contextmenu", preventRightClickOptions);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("contextmenu", preventRightClickOptions);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      id="file-options"
      className={classNames(
        "fixed translate-x-0 translate-y-0 p-[14px] rounded-[20px] bg-white text-black w-[323px] shadow",
        isShowingOptions
          ? "z-10 visible opacity-100"
          : "-z-50 invisible opacity-0"
      )}
      style={{ top: coord.y, left: coord.x }}
    >
      <div className="divide-y divide-[#EBEBEB] w-full">
        <ul className="pb-2 mb-1 rounded-[20px]">
          {/* Open in Google Drive */}
          {/* Hide if the selected files is more than 1 */}

          {selectedFiles.length === 1 ? (
            <li className="py-[10px] px-[10px] cursor-pointer group rounded-[10px] hover:bg-gray-50">
              <Link passHref href="/" className="flex items-center">
                <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white">
                  <Image
                    src={provider.image}
                    alt={`${provider.name} icon`}
                    width={22}
                    height={22}
                    className="flex-shrink-0"
                  />
                </div>

                <span className="ml-3 font-inter font-medium text-sm">
                  Open in {provider.name}
                </span>
              </Link>
            </li>
          ) : null}

          <Popover className="relative" as="li">
            <Popover.Button className="py-[10px] w-full px-[10px] cursor-pointer group rounded-[10px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white">
                    <BoltIcon
                      aria-hidden="true"
                      className="w-[22px] h-[22px] text-gray-500 group-hover:text-gray-600"
                    />
                  </div>
                  <span className="ml-3 font-inter font-medium text-sm">
                    Transfer to
                  </span>
                </div>

                <ArrowSmallDownIcon className="w-6 h-6 text-fontBlack/70" />
              </div>
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute mt-2 left-1/2 z-20 flex w-screen max-w-max -translate-x-1/2">
                <ul className="w-screen p-[14px] rounded-[20px] max-w-[18rem] flex-auto overflow-hidden bg-white text-sm shadow-lg ring-1 ring-gray-900/5">
                  {targetUploadProviders.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => transferFile(p)}
                        className="w-full flex items-center py-[10px] px-[10px] cursor-pointer group rounded-[10px] hover:bg-youngPrimary"
                      >
                        <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white">
                          <Image
                            src={p.image}
                            alt={`${p.name} icon`}
                            width={22}
                            height={22}
                            className="flex-shrink-0"
                          />
                        </div>

                        <span className="ml-3 font-inter font-medium text-sm">
                          {p.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Popover.Panel>
            </Transition>
          </Popover>
        </ul>

        <ul className="pt-3">
          {otherActions.map((menu) => (
            <li
              key={menu.label}
              className="py-[10px] px-[10px] cursor-pointer group rounded-[10px] hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white">
                  <menu.Icon
                    aria-hidden="true"
                    className="w-[22px] h-[22px] text-gray-500 group-hover:text-gray-600"
                  />
                </div>
                <span className="ml-3 font-inter font-medium text-sm">
                  {menu.label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileOptions;
