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
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
import { Transition, Dialog } from "@headlessui/react";

import classNames from "../utils/classNames";
import type { UploadInfoProgress } from "../types";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

const UploadProgressInfo: FunctionComponent = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [openWarningModal, setOpenWarningModal] = useState(false);

  const show = useUploadInfoProgress((s) => s.show);
  const setShow = useUploadInfoProgress((s) => s.setShow);
  const uploadInfoProgress = useUploadInfoProgress((s) => s.uploadInfoProgress);

  const completedLength = useMemo(
    () =>
      uploadInfoProgress.filter((info) => !info.isLoading && !info.error)
        .length,
    [uploadInfoProgress]
  );

  const loadingLength = useMemo(
    () => uploadInfoProgress.filter((info) => info.isLoading).length,
    [uploadInfoProgress]
  );

  function onCancelAllUpload() {
    const isAllDone = uploadInfoProgress.filter(
      (info) => !info.isLoading && !info.error
    ).length;

    const isAllError = uploadInfoProgress.filter((info) => info.error).length;

    if (isAllDone || isAllError) {
      setShow(false);
      useUploadInfoProgress.getState().clearUploadInfoProgress();
      return;
    }

    setOpenWarningModal(true);
  }

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
          translate: show ? (isMinimized ? "0 80%" : "0 0") : "0 100%",
          zIndex: show ? 10 : 0,
        }}
        className="fixed z-10 shadow-2xl border-2 border-b-0 bg-white border-blue-200 w-full max-w-sm rounded-t-2xl -bottom-1 right-5 h-full max-h-96 overflow-hidden transition-all duration-300"
      >
        <div className="relative">
          {/* Header */}
          <div className="fixed top-0 w-full">
            <div className="flex items-start justify-between relative bg-indigo-50 py-4 px-5 rounded-t-2xl">
              <div>
                <h4 className="font-medium text-lg text-gray-600">
                  {!loadingLength
                    ? `${completedLength} upload complete`
                    : `Uploading ${loadingLength} item`}
                </h4>
                <p className="text-xs text-gray-500/80">
                  Upload speed depends on the provider servers latency
                </p>
              </div>

              <div className="flex items-center space-x-3 absolute top-4 right-5">
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
                  title="Cancel"
                  data-tip="Cancel"
                  className="tooltip tooltip-bottom focus:outline-none"
                  onClick={onCancelAllUpload}
                >
                  <XMarkIcon
                    aria-hidden="true"
                    className="w-6 h-6 text-gray-600"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="h-[75px]"></div>

          {/* Body */}
          <div className="bg-white overflow-y-auto max-h-[305px] pb-2">
            {uploadInfoProgress.map((info) => (
              <IndividualFileInfo info={info} key={info.id} />
            ))}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UploadProgressInfo;

interface IIndividualFileInfoProps {
  info: UploadInfoProgress;
}
const IndividualFileInfo: FunctionComponent<IIndividualFileInfoProps> = ({
  info,
}) => {
  const isDone = !info.isLoading && !info.error;
  const percentage = Math.round(
    (info.downloadProgress + info.uploadProgress) / 2
  );

  return (
    <div
      className={classNames(
        "flex even:bg-gray-50 justify-between space-x-5 py-3.5 px-5",
        info.error ? "items-center" : "items-start"
      )}
      key={info.id}
    >
      <div className="flex items-center w-full">
        <div className="w-6 flex-shrink-0 mr-1.5">
          <Image
            width={500}
            height={500}
            alt={`${info.name} icon`}
            src={info.iconLink}
          />
        </div>
        <div className="w-full">
          <h3 className="text-gray-500 font-bold text-sm text-ellipsis overflow-hidden whitespace-nowrap">
            {info.name}
          </h3>

          {info.error ? (
            <p className="text-red-500 font-medium text-xs">{info.error}</p>
          ) : (
            <p className="text-gray-500 font-medium text-xs">{info.info}</p>
          )}
        </div>
      </div>

      <div className="relative w-6 h-6 rounded-full">
        <div
          className={classNames(
            "absolute inset-0 tooltip tooltip-bottom",
            info.isLoading
              ? "opacity-100 z-0 scale-100"
              : "opacity-0 -z-50 scale-0"
          )}
          data-tip="Loading"
        >
          <div className="w-6 h-6 border-[3px] border-gray-300 rounded-full absolute inset-0"></div>
          <div
            className="z-10 radial-progress text-indigo-500"
            style={{
              // @ts-ignore - this is a custom attribute
              "--value": percentage,
              "--size": "24px",
              "--thickness": "3px",
            }}
          ></div>
        </div>
        <div
          data-tip="Done"
          className={classNames(
            "tooltip absolute inset-0 tooltip-bottom focus:outline-none transition-all duration-200",
            isDone ? "opacity-100 z-0 scale-100" : "opacity-0 -z-50 scale-0"
          )}
        >
          <CheckCircleIcon
            aria-hidden="true"
            className="w-6 h-6 text-green-600"
          />
        </div>
        <div
          data-tip="Error"
          className={classNames(
            "tooltip absolute inset-0 tooltip-bottom focus:outline-none transition-all duration-200",
            info.error ? "opacity-100 z-0 scale-100" : "opacity-0 -z-50 scale-0"
          )}
        >
          <XCircleIcon aria-hidden="true" className="w-6 h-6 text-red-500" />
        </div>
      </div>
    </div>
  );
};

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
