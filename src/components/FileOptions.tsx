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

import { PROVIDERS, TRANSFER_CONCURRENT_LIMIT } from "../constants";
import type { ProviderObject, UploadInfoProgress } from "../types";

import classNames from "../utils/classNames";
import zipAndDownloadFiles from "../utils/zipAndDownloadFiles";
import createUploadInfoProgress from "../utils/createUploadInfoProgress";

import useGetFiles from "../hooks/useGetFiles";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useCloudProvider from "../hooks/useCloudProvider";
import useGetLinkedAccounts from "../hooks/useGetLinkedAccounts";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";
import useTransferFilesModal from "../hooks/useTransferFilesModal";
import useDeleteFilesModalState from "../hooks/useDeleteFilesModalState";
import useUnConnectedTranferModal from "../hooks/useUnConnectedTransferModal";
import createExportDownloadUrl from "../utils/createExportDownloadUrl";

const TransferFilesModal = dynamic(() => import("./TransferFilesModal"));

const FileOptions: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: allFiles } = useGetFiles();

  const [coord, setCoord] = useState({ x: 0, y: 0 });
  const [isShowingOptions, setIsShowingOptions] = useState(false);

  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [transferToPath, setTransferToPath] = useState<string | undefined>("");

  const selectedFiles = useSelectedFiles((s) => s.files, shallow);
  const replaceAllSelectedFiles = useSelectedFiles((s) => s.replaceAllFiles);

  const provider = useCloudProvider((s) => s.provider, shallow);

  const openDeleteModal = useDeleteFilesModalState((s) => s.openModal);

  const { data: providerAccountInfo } = useGetLinkedAccounts();

  const downloadFiles = useCallback(async () => {
    setIsShowingOptions(false);

    // If the selected files more than 1, we will download them as a zip file
    if (selectedFiles.length > 1) {
      const toastId = "zipAndDownloadFiles";
      toast.loading("Zipping files...", { id: toastId });
      try {

        await zipAndDownloadFiles(selectedFiles, toastId);
        toast.success("Downloading files...", { id: toastId });

      } catch (error: any) {
        toast.error(error.message, { id: toastId });
      }
      return;
    } else if (selectedFiles[0].mimeType?.startsWith('application/vnd.google-apps')) {

      const file = selectedFiles[0];

      // Ask the server for the export 
      const downloadUrl = createExportDownloadUrl(file.mimeType!, file.downloadUrl, file.name);
      return window.open(downloadUrl, "_blank");

    }

    const file = selectedFiles[0];
    const downloadUrlInUrl = new URL(file.downloadUrl);
    downloadUrlInUrl.searchParams.set('filename', file.name);

    return window.open(downloadUrlInUrl, "_blank");
  }, [selectedFiles, setIsShowingOptions]);

  const getFileLink = useCallback(async () => {
    setIsShowingOptions(false);

    const file = selectedFiles[0];
    await toast.promise(navigator.clipboard.writeText(file.webUrl), {
      error: "Failed to copy link!",
      loading: "Copying link...",
      success: "Copied to clipboard!",
    });
  }, [selectedFiles, setIsShowingOptions]);

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
  }, [downloadFiles, getFileLink, openDeleteModal, selectedFiles.length, setIsShowingOptions]);

  const targetUploadProviders = useMemo(
    () => PROVIDERS.filter((p) => p.id !== provider.id),
    [provider.id]
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

  const transferFiles = useCallback(
    async (providerTarget: ProviderObject) => {
      setIsShowingOptions(false);

      const transferFileToastId = `transfer-files-${Math.random()
        .toString(36)
        .substring(7)}`;

      // Func to update upload info progress
      const { setShow: setShowUploadInfoProgress } =
        useUploadInfoProgress.getState();

      async function each(info: UploadInfoProgress) {
        try {
          await info.upload();
        } catch (error: any) {
          // Server timeout for some reason?
          if (error.message === 'No response. Please try again.') {
            // Retry the transfer automatically for one time
            console.log(`Retrying timeout for: ${info.filename}`);
            await info.upload();
          }
        }
      }

      try {
        // Initiate upload info progress
        const uploadInfoProgress = selectedFiles.map((file) => createUploadInfoProgress({
          transferToPath,
          fileId: file.id,
          fileName: file.name,
          fileProviderId: file.from,
          fileIconLink: file.iconLink,
          providerTargetId: providerTarget.id
        }));

        toast.loading(
          `Transferring ${uploadInfoProgress.length} files to ${providerTarget.name}`,
          {
            duration: 3000,
            id: transferFileToastId,
          }
        );

        // Show upload info progress,
        setShowUploadInfoProgress(true);

        /**
         * Transfer the files concurrently
         * with maximum transfer limit
         */
        const first5Files = uploadInfoProgress.slice(0, TRANSFER_CONCURRENT_LIMIT);
        for await (const info of first5Files) {
          await each(info);
        }
      } catch (error: any) {
        toast.error(error.message, { id: transferFileToastId });
      } finally {
        setTransferToPath(undefined);
      }
    },
    [selectedFiles, setIsShowingOptions, setTransferToPath, transferToPath]
  );

  function onTransferClick(providerTarget: ProviderObject) {
    // Check if the user account is connected to the choosen provider
    if (!providerAccountInfo?.find((account) => account.providers.includes(providerTarget.id))) {
      setIsShowingOptions(false);
      useUnConnectedTranferModal.setState({ open: true, unConnectedProviderId: providerTarget.id });
      return;
    }

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
