import {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
  // @ts-ignore - No types
  experimental_useEffectEvent as useEffectEvent,
  useCallback,
} from "react";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { Popover, Transition } from "@headlessui/react";

import BoltIcon from "@heroicons/react/24/outline/BoltIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import PaperClipIcon from "@heroicons/react/24/outline/PaperClipIcon";
import ArrowDownTrayIcon from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import ArrowSmallDownIcon from "@heroicons/react/24/outline/ArrowSmallDownIcon";

import type {
  ITransferFileParams,
  ProviderObject,
  UploadInfoProgress,
} from "../types";
import { PROVIDERS } from "../constants";

import classNames from "../utils/classNames";
import zipAndDownloadFiles from "../utils/zipAndDownloadFiles";

import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";
import googlephotosApi from "../apis/googlephotos.api";

import useGetFiles from "../hooks/useGetFiles";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useCloudProvider from "../hooks/useCloudProvider";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";
import useTransferFilesModal from "../hooks/useTransferFilesModal";
import useDeleteFilesModalState from "../hooks/useDeleteFilesModalState";

const TransferFilesModal = dynamic(() => import("./TransferFilesModal"));

const FileOptions: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: allFiles } = useGetFiles();

  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [isShowingOptions, setIsShowingOptions] = useState(false);

  const [transferToPath, setTransferToPath] = useState<string | undefined>(
    undefined
  );
  const [openTransferModal, setOpenTransferModal] = useState(false);

  const selectedFiles = useSelectedFiles((s) => s.files, shallow);
  const replaceAllSelectedFiles = useSelectedFiles((s) => s.replaceAllFiles);

  const provider = useCloudProvider((s) => s.provider, shallow);

  const openDeleteModal = useDeleteFilesModalState((s) => s.openModal);

  const downloadFiles = useCallback(async () => {
    setIsShowingOptions(false);

    // If the selected files more than 1, we will download them as a zip file
    if (selectedFiles.length > 1) {
      const toastId = "zipAndDownloadFiles";
      toast.loading("Zipping files...", { id: toastId });
      try {
        await zipAndDownloadFiles(selectedFiles, toastId);

        toast.success("Downloading files...", { id: toastId });
        return;
      } catch (error: any) {
        toast.error(error.message, { id: toastId });
      }
      return;
    }

    return window.open(selectedFiles[0].downloadUrl, "_blank");
  }, [selectedFiles]);

  const getFileLink = useCallback(async () => {
    setIsShowingOptions(false);

    const file = selectedFiles[0];
    await toast.promise(navigator.clipboard.writeText(file.webUrl), {
      error: "Failed to copy link!",
      loading: "Copying link...",
      success: "Copied to clipboard!",
    });
  }, [selectedFiles]);

  const otherActions = useMemo(() => {
    return [
      {
        Icon: PaperClipIcon,
        label: "Get Link",
        onClick: getFileLink,
        show: selectedFiles.length === 1,
      },
      // {
      //   Icon: StarIcon,
      //   label: "Add to favorites",
      //   onClick: () => {},
      // },
      {
        Icon: ArrowDownTrayIcon,
        label: "Download",
        onClick: downloadFiles,
        show: true,
      },
      {
        Icon: TrashIcon,
        label: "Delete",
        onClick: () => {
          setIsShowingOptions(false);
          openDeleteModal();
        },
        show: true,
      },
    ];
  }, [downloadFiles, getFileLink, openDeleteModal, selectedFiles.length]);

  const targetUploadProviders = useMemo(
    () => PROVIDERS.filter((p) => p.id !== provider.id),
    [provider.id]
  );

  const setShowUploadInfoProgress = useUploadInfoProgress((s) => s.setShow);
  const addUploadInfoProgress = useUploadInfoProgress(
    (s) => s.addUploadInfoProgress
  );

  const transferFileFunc = useCallback(
    (
      params: ITransferFileParams
    ) => {
      switch (provider.id) {
        case "onedrive": {
          return onedriveApi.transferFile(params);
        }

        case "google_photos": {
          return googlephotosApi.transferFile(params);
        }

        case "google_drive": {
          return googledriveApi.transferFile(params);
        }

        default:
          throw new Error("Unsupported Provider!");
      }
    },
    [provider.id]
  );

  const transferFiles = useCallback(
    async (providerTarget: ProviderObject) => {
      setIsShowingOptions(false);

      const transferFileToastId = `transfer-files-${Math.random()
        .toString(36)
        .substring(7)}`;

      // Func to update upload info progress
      const updateUploadInfoProgress =
        useUploadInfoProgress.getState().updateUploadInfoProgress;

      try {
        // Initiate upload info progress
        const selectedFilesWithAbortController = selectedFiles.map((file) => {
          const requiredParams: UploadInfoProgress = {
            ...file,
            progress: 0,
            status: 'in_progress',
            providerId: file.from,
            upload: () => transferFileFunc({ id: file.id, providerTargetId: providerTarget.id, path: transferToPath }),
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
          `Transferring ${selectedFilesWithAbortController.length} files to ${providerTarget.name}`,
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
            .uploadInfoProgress.filter((info) => info.status === 'failed').length ===
          selectedFilesWithAbortController.length;

        if (isAllError) {
          toast.error(`Transfer failed`, {
            id: transferFileToastId,
          });
        }
      } catch (error: any) {
        toast.error(error.message, {
          id: transferFileToastId,
        });
      } finally {
        setTransferToPath(undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedFiles, transferFileFunc]
  );

  const getAndAddFile = useEffectEvent((fileIdFromAttribute: string) => {
    if (selectedFiles.find((f) => f.id === fileIdFromAttribute)) return true;

    const fileFromId = allFiles.files.find(
      (file) => file.id === fileIdFromAttribute
    );

    if (!fileFromId) return false;

    replaceAllSelectedFiles(fileFromId);
    return true;
  });

  function onTransferClick(providerTarget: ProviderObject) {
    if (providerTarget.id === "google_photos") {
      return transferFiles(providerTarget);
    }

    if (openTransferModal) {
      return transferFiles(providerTarget);
    }

    useTransferFilesModal.setState({ providerTarget });
    setOpenTransferModal(true);
  }

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
      <TransferFilesModal
        path={transferToPath}
        setPath={setTransferToPath}
        open={openTransferModal}
        setOpen={setOpenTransferModal}
        transferFiles={transferFiles}
      />

      <div className="divide-y divide-[#EBEBEB] w-full">
        <ul className="pb-2 mb-1 rounded-[20px]">
          {/* Open in Google Drive */}
          {/* Hide if the selected files is more than 1 */}

          {selectedFiles.length === 1 ? (
            <li className="py-[10px] px-[10px] cursor-pointer group rounded-[10px] hover:bg-gray-50">
              <Link
                passHref
                target="_blank"
                className="flex items-center"
                href={selectedFiles[0].webUrl}
              >
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
                        onClick={() => onTransferClick(p)}
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
          {otherActions.map((menu) =>
            menu.show ? (
              <li key={menu.label}>
                <button
                  type="button"
                  onClick={menu.onClick}
                  className="w-full flex items-center py-[10px] px-[10px] cursor-pointer group rounded-[10px] hover:bg-gray-50"
                >
                  <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white">
                    <menu.Icon
                      aria-hidden="true"
                      className="w-[22px] h-[22px] text-gray-500 group-hover:text-gray-600"
                    />
                  </div>
                  <span className="ml-3 font-inter font-medium text-sm">
                    {menu.label}
                  </span>
                </button>
              </li>
            ) : null
          )}
        </ul>
      </div>
    </div>
  );
};

export default FileOptions;
