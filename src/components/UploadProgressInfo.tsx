import {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import {
  ChevronDownIcon,
  XMarkIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
import { Transition, Dialog } from "@headlessui/react";

import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

const UploadProgressInfo: FunctionComponent = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [openWarningModal, setOpenWarningModal] = useState(false);

  const show = useUploadInfoProgress((s) => s.show);
  const uploadInfoProgress = useUploadInfoProgress((s) => s.uploadInfoProgress);

  const completedLength = useMemo(
    () =>
      uploadInfoProgress.filter((info) => !info.isLoading && !info.isError)
        .length,
    [uploadInfoProgress]
  );

  const loadingLength = useMemo(
    () => uploadInfoProgress.filter((info) => info.isLoading).length,
    [uploadInfoProgress]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k") {
        setIsMinimized((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Fragment>
      <WarningModal open={openWarningModal} setOpen={setOpenWarningModal} />
      <div
        style={{
          translate: show ? (isMinimized ? "0 84%" : "0 0") : "0 100%",
          zIndex: show ? 10 : 0,
        }}
        className="fixed z-10 shadow-lg border border-b-0 bg-white border-blue-500 w-full max-w-sm rounded-t-2xl -bottom-1 right-5 h-full max-h-80 overflow-y-auto scrollbar-hide transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-blue-50 p-3 px-4 rounded-t-2xl">
          <h4 className="text-base font-medium text-gray-700">
            {!loadingLength
              ? `${completedLength} upload complete`
              : `Uploading ${uploadInfoProgress.length} item`}
          </h4>

          <div className="flex items-center space-x-3">
            <button
              title="Minimize"
              data-tip="Minimize"
              className="tooltip tooltip-bottom focus:outline-none"
              onClick={
                isMinimized
                  ? () => setIsMinimized(false)
                  : () => setIsMinimized(true)
              }
            >
              {isMinimized ? (
                <ChevronUpIcon
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-600"
                />
              ) : (
                <ChevronDownIcon
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-600"
                />
              )}
            </button>
            <button
              title="Close"
              data-tip="Close"
              className="tooltip tooltip-bottom focus:outline-none"
              onClick={() => setOpenWarningModal(true)}
            >
              <XMarkIcon aria-hidden="true" className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white">
          {uploadInfoProgress.map((info) => (
            <div
              className="flex even:bg-gray-50 items-center justify-between space-x-5 py-3.5 px-4"
              key={info.id}
            >
              <div className="space-x-3 flex items-center w-full">
                <div className="w-6 flex-shrink-0 mr-1.5">
                  <Image
                    width={500}
                    height={500}
                    alt={`HelloWorld`}
                    src={info.iconLink}
                  />
                </div>
                <div className="w-full">
                  <p className="text-gray-700 font-medium text-[13px] text-ellipsis overflow-hidden whitespace-nowrap">
                    {info.name}
                  </p>
                  <div className="w-full h-2.5 relative">
                    <div
                      style={{
                        width: `${
                          (info.downloadProgress + info.uploadProgress) / 2
                        }%`,
                      }}
                      className="h-1 mt-1 rounded absolute inset-0 z-10 bg-indigo-500"
                    ></div>
                    <div className="h-1 mt-1 rounded w-full absolute inset-0 bg-gray-200"></div>
                  </div>
                </div>
              </div>

              {/* Create a circle where the border width can control using javascript */}
              <button
                title="Cancel upload"
                data-tip="cancel"
                className="tooltip tooltip-bottom focus:outline-none"
              >
                <XMarkIcon
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-600"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default UploadProgressInfo;

interface IWaringModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const WarningModal: FunctionComponent<IWaringModalProps> = ({
  open = false,
  setOpen,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const clearUploadInfoProgress = useUploadInfoProgress(
    (s) => s.clearUploadInfoProgress
  );
  const uploadInfoProgress = useUploadInfoProgress((s) => s.uploadInfoProgress);

  function cancelAllUploads() {
    uploadInfoProgress.forEach(({ abortController }) => {
      abortController.abort();
    });

    setOpen(false);
    clearUploadInfoProgress();

    toast.success("Uploads cancelled");
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
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
                        Cancel Upload
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to cancel the transfer process?
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={cancelAllUploads}
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto focus:outline-none"
                  >
                    <span>{`Yes, I'm`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Close
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
