import {
  Fragment,
  FunctionComponent,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

import { shallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";
import { Transition, Dialog } from "@headlessui/react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

import type {
  GetFilesReturn,
  GlobalItemTypes,
  Provider,
  ProviderObject,
} from "../types";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useGetFilesFunc from "../hooks/useGetFilesFunc";
import useTransferFilesModal from "../hooks/useTransferFilesModal";

import Folder from "./Folder";
import LoadingIcon from "./LoadingIcon";
import Breadcrumbs from "./Breadcrumbs";
import BeautifulError from "./BeautifulError";
import FoldersSkeletonLoading from "./FoldersSkeletonLoading";

interface ITransferFilesModalProps {
  path: string | undefined;
  setPath: (path: string | undefined) => void;

  open: boolean;
  setOpen: (open: boolean) => void;

  transferFiles: (providerTarget: ProviderObject) => Promise<void>;
}

const TransferFilesModal = memo<ITransferFilesModalProps>(
  function TransferFilesModal(props) {
    const { path, setPath, open, setOpen, transferFiles } = props;

    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const providerTarget = useTransferFilesModal(
      (s) => s.providerTarget,
      shallow
    );

    if (!providerTarget) return null;

    const onCancelClick = () => {
      setPath(undefined);
      setOpen(false);
    };

    const onTransferClick = async () => {
      setOpen(false);
      await transferFiles(providerTarget!);
    };

    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
          id="transfer-files-modal"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all my-8 w-screen max-w-6xl">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex items-center">
                      <div className="mx-auto flex flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-0 sm:h-14 sm:w-14">
                        <ArrowsRightLeftIcon
                          className="h-7 w-7 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-gray-900"
                        >
                          Transfer Files to {providerTarget.name}
                        </Dialog.Title>
                        <div className="mt-1">
                          <p className="text-base text-gray-600">
                            Select the folder where you want to transfer the
                            files (optional)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="min-h-[10rem] mt-10">
                      <Breadcrumbs
                        fontSize="text-lg"
                        iconSize="4"
                        path={path}
                        setPath={setPath}
                      />

                      <Folders
                        path={path}
                        setPath={setPath}
                        providerTargetId={providerTarget.id}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      onClick={onTransferClick}
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto focus:outline-none"
                    >
                      <span>Transfer here</span>
                    </button>
                    <button
                      type="button"
                      ref={cancelButtonRef}
                      onClick={onCancelClick}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }
);

export default TransferFilesModal;

interface IFoldersProps {
  path: string | undefined;
  setPath: (path: string | undefined) => void;
  providerTargetId: Provider;
}

const Folders: FunctionComponent<IFoldersProps> = (props) => {
  const { path, setPath, providerTargetId } = props;

  const enabled = providerTargetId !== "google_photos";

  const folderContainerRef = useRef<HTMLDivElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<GlobalItemTypes | null>(
    null
  );

  const getFiles = useGetFilesFunc(providerTargetId);

  const { isLoading, isError, error, isFetching, data } = useQuery<
    GetFilesReturn,
    HttpErrorExeption
  >({
    queryFn: () => getFiles({ path, foldersOnly: true }),
    queryKey: ["transfer_files_folders", providerTargetId, path],
    retry: false,
    enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: process.env.NODE_ENV === "production",
  });

  async function onDoubleClick(folder: GlobalItemTypes) {
    const newPath = path
      ? `${path}/${folder.name}~${folder.id}`
      : `/${folder.name}~${folder.id}`;

    setPath(newPath);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        folderContainerRef.current &&
        !folderContainerRef.current.contains(event.target as Node)
      )
        setSelectedFolder(null);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="w-full mt-[30px]">
      <div className="flex items-center space-x-3">
        <h2 className="font-medium font-inter text-fontBlack2 text-xl">
          Folders
        </h2>
        {isFetching ? <LoadingIcon fill="#313132" className="w-4 h-4" /> : null}
      </div>

      {isLoading ? (
        <FoldersSkeletonLoading />
      ) : isError && error?.message !== "Unauthorized" ? (
        <BeautifulError.Root>
          <BeautifulError.Title title="Something went wrong" />
          <BeautifulError.Message message={error.message} />
        </BeautifulError.Root>
      ) : (
        <div
          ref={folderContainerRef}
          className="grid grid-cols-5 gap-5 mt-[30px]"
        >
          <Fragment>
            {(data?.files.length || 0) > 0 ? (
              data?.files.map((folder) => (
                <Folder
                  key={folder.id}
                  folder={folder}
                  onDoubleClick={onDoubleClick}
                  selectedFolder={selectedFolder}
                  setSelectedFolder={setSelectedFolder}
                />
              ))
            ) : (
              <p className="text-base font-inter font-medium mt-2 text-gray-600">
                This folder is empty
              </p>
            )}
          </Fragment>
        </div>
      )}
    </div>
  );
};
