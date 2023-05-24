import {
  Fragment,
  FunctionComponent,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
import ArrowPathIcon from "@heroicons/react/24/outline/ArrowPathIcon";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/outline/ExclamationTriangleIcon";

import { toast } from "react-hot-toast";
import { Transition, Dialog } from "@headlessui/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import classNames from "../utils/classNames";
import type { UploadInfoProgress } from "../types";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

const LoadingIcon = dynamic(() => import("./LoadingIcon"));

const UploadProgressInfo: FunctionComponent = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [openWarningModal, setOpenWarningModal] = useState(false);

  const [animationParenntRef] = useAutoAnimate({ duration: 200 });

  const show = useUploadInfoProgress((s) => s.show);
  // const show = useUploadInfoProgress((s) => true);
  const setShow = useUploadInfoProgress((s) => s.setShow);
  const uploadInfoProgress = useUploadInfoProgress((s) => s.uploadInfoProgress);

  const completedLength = useMemo(
    () =>
      uploadInfoProgress.filter((info) => info.status === "completed")
        .length,
    [uploadInfoProgress]
  );

  const loadingLength = useMemo(
    () => uploadInfoProgress.filter((info) => info.status === 'in_progress' || info.status === 'starting').length,
    [uploadInfoProgress]
  );

  const allFailed = useMemo(() => {
    const errorUpload = uploadInfoProgress.filter((info) => !!info.error);

    /**
     * If all upload is failed, returns how many of them are failed.
     */
    return errorUpload.length === uploadInfoProgress.length ? errorUpload.length : 0;
  }, [uploadInfoProgress]);

  function onCancelAllUpload() {
    const isAllDone =
      uploadInfoProgress.filter((info) => info.status === 'completed')
        .length === uploadInfoProgress.length;

    const isAllError =
      uploadInfoProgress.filter((info) => info.error).length ===
      uploadInfoProgress.length;

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
          translate: show ? (isMinimized ? "0 83%" : "0 0") : "0 100%",
          zIndex: show ? 10 : 0,
        }}
        className="fixed p-5 z-10 shadow-2xl bg-white w-full max-w-sm rounded-t-2xl bottom-0 right-16 h-full max-h-96 overflow-hidden transition-all duration-300"
      >
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between space-x-1">
            <h5 className="text-center font-inter text-gray-700 font-medium text-lg">
              {allFailed > 0 ? `${allFailed} failed` : completedLength
                ? `${completedLength} Upload Completed`
                : `Uploading ${loadingLength}`}
            </h5>

            <div>
              <button
                type="button"
                onClick={() => {
                  setIsMinimized((prev) => !prev);
                }}
                className="p-2 rounded-[8px] hover:bg-gray-100"
              >
                {isMinimized ? (
                  <ChevronUpIcon
                    className="w-5 h-5 text-gray-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDownIcon
                    className="w-5 h-5 text-gray-500"
                    aria-hidden="true"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={onCancelAllUpload}
                className="p-2 rounded-[8px] hover:bg-gray-100"
              >
                <XMarkIcon
                  className="w-5 h-5 text-gray-500"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            ref={animationParenntRef}
            className={classNames(
              "bg-white max-h-[305px] pb-2 space-y-2.5 mt-3 pr-2",
              uploadInfoProgress.length > 5
                ? "overflow-y-auto"
                : "overflow-hidden"
            )}
          >
            {uploadInfoProgress.map((info) => (
              <IndividualFileInfo
                info={info}
                key={info.fileId}
                uploadInfoProgress={uploadInfoProgress}
              />
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
  uploadInfoProgress: Array<UploadInfoProgress>;
}
const IndividualFileInfo = memo<IIndividualFileInfoProps>(
  function IndividualFileInfo(props) {
    const { info, uploadInfoProgress } = props;

    const isError = !!info.error;
    const isStarting = info.status === 'starting';
    const isLoading = info.status === 'in_progress';
    const isDone = !isLoading && !isError;

    const removeUploadInfoProgress = useUploadInfoProgress(
      (s) => s.removeUploadInfoProgress
    );

    const updateUploadInfoProgress = useUploadInfoProgress(
      (s) => s.updateUploadInfoProgress
    );

    function cancelUpload() {
      // TODO: Handle cancel upload
      // socket?.emit(CANCEL_UPLOAD_EVENT, info.id);
      if (uploadInfoProgress.length === 1) {
        useUploadInfoProgress.getState().setShow(false);
        removeUploadInfoProgress(info.fileId);
      }
    }

    async function retryUpload() {
      try {
        updateUploadInfoProgress({
          progress: 0,
          fileId: info.fileId,
          error: undefined,
          status: 'in_progress'
        });
        await info.upload();
      } catch (error) { }
    }

    return (
      <div className="flex justify-between border rounded-[10px] p-2 space-x-5">
        <div
          className={classNames(
            "flex w-full overflow-hidden",
            isError ? "items-start" : "items-center"
          )}
        >
          <div className="w-8 flex-shrink-0">
            <Image
              width={500}
              height={500}
              alt={`${info.filename} icon`}
              src={info.iconLink}
            />
          </div>
          <div className="ml-2 -mt-1 w-full">
            <Link href="/" passHref>
              <h3 className="text-gray-500 w-full font-inter text-sm text-ellipsis overflow-hidden whitespace-nowrap hover:text-gray-700">
                {info.filename}
              </h3>
            </Link>

            {isError ? (
              <p className="text-red-500 font-medium text-xs">{info.error}</p>
            ) : isLoading ? (
              <div className="relative mt-1.5">
                <div
                  style={{ width: `${info.progress}%` }}
                  className="ring-1 absolute inset-0 z-10 ring-primary/70"
                ></div>
                <div className="ring-1 absolute inset-0 w-full ring-gray-200"></div>
              </div>
            ) : isStarting ? (
              <div className="mt-1.5 relative overflow-hidden h-1">
                <div
                  className="absolute z-10 ring-2 w-56 ring-primary/70 progress-starting"
                ></div>
                <div className="ring-1 absolute inset-0 w-full ring-gray-200"></div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Percentage, Loading Icon, and Cancel button */}
        <div className="flex items-center space-x-3 pr-1 flex-shrink-0">
          {isStarting ? null : (
            <Fragment>
              {isLoading ? (
                <span className="font-inter font-medium text-xs text-gray-500">
                  {info.progress}%
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

              {isLoading ? (
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
            </Fragment>
          )}
        </div>
      </div>
    );
  }
);

interface IWaringModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const WarningModal = memo<IWaringModalProps>(function WarningModal({
  open,
  setOpen,
}) {

  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const clearUploadInfoProgress = useUploadInfoProgress(
    (s) => s.clearUploadInfoProgress
  );
  // const uploadInfoProgress = useUploadInfoProgress(
  //   (s) => s.uploadInfoProgress
  // );

  const cancelAllUploads = () => {
    // uploadInfoProgress.forEach(({ id }) => {
    //   io?.emit('CANCEL_UPLOAD', id);
    // });

    setOpen(false);
    clearUploadInfoProgress();

    toast.success("Uploads cancelled");
  };

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
                          Are you sure you want to cancel the transfer
                          process? This action cannot be undone.
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
});
