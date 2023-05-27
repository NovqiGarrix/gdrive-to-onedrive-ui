import {
  Dispatch,
  Fragment,
  FunctionComponent,
  SetStateAction,
  useCallback,
  useRef,
} from "react";

import { toast } from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import type { GlobalItemTypes } from "../types";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useGetFolders from "../hooks/useGetFolders";
import useCloudProvider from "../hooks/useCloudProvider";

import LoadingIcon from "./LoadingIcon";

interface IDeleteFolderModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;

  selectedFolder: GlobalItemTypes | null;
  setSelectedFolder: Dispatch<SetStateAction<GlobalItemTypes | null>>;
}

const DeleteFolderModal: FunctionComponent<IDeleteFolderModalProps> = (
  props
) => {
  const { open, setOpen, selectedFolder, setSelectedFolder } = props;

  const cancelButtonRef = useRef(null);
  const queryClient = useQueryClient();

  const providerId = useCloudProvider((s) => s.provider.id);
  const { queryKey } = useGetFolders(providerId !== "google_photos");

  const deleteFolderFunc = useCallback(
    async (folderId: string) => {
      switch (providerId) {
        case "onedrive": {
          const onedriveApi = (await import("../apis/onedrive.api")).default;
          return onedriveApi.deleteFolder(folderId);
        }

        case "google_drive": {
          const googledriveApi = (await import("../apis/googledrive.api"))
            .default;
          return googledriveApi.deleteFolder(folderId);
        }

        default:
          throw new Error("Unsupported provider");
      }
    },
    [providerId]
  );

  async function deleteFolder() {
    if (!selectedFolder) return;
    await deleteFolderFunc(selectedFolder.id);
    await queryClient.refetchQueries(queryKey);
  }

  const { mutateAsync, isLoading } = useMutation<void, HttpErrorExeption>({
    mutationFn: deleteFolder,
    mutationKey: ["deleteFolder", selectedFolder?.id],

    onSuccess() {
      setSelectedFolder(null);
    },

    onError(error) {
      try {
        const errs = JSON.parse(error.message) as Array<{
          name: string;
          error: string;
        }>;

        errs.forEach((err) => {
          toast.error(`Failed: ${err.name}: ${err.error}`);
        });
      } catch (_err) {
        toast.error(error.message);
      }
    },

    onSettled() {
      setOpen(false);
    },
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        onClose={setOpen}
        className="relative z-10"
        id="delete-folders-modal"
        initialFocus={cancelButtonRef}
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Delete?
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this folder? This
                          action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={() => {
                      toast.promise(mutateAsync(), {
                        loading: "Deleting...",
                        success: <b>Files deleted!</b>,
                        error: <b>Failed to delete the files.</b>,
                      });
                    }}
                    disabled={isLoading}
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto focus:outline-none"
                  >
                    {isLoading ? (
                      <LoadingIcon fill="#fff" className="w-5 h-5" />
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
};

export default DeleteFolderModal;
