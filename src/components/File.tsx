import {
  DragEvent,
  FunctionComponent,
  MouseEvent,
  useCallback,
  useMemo,
} from "react";

import Image from "next/image";

import classNames from "../utils/classNames";
import useSelectedFiles from "../hooks/useSelectedFiles";
import type { GlobalItemTypes, Provider } from "../types";

interface IFileProps {
  providerId: Provider;
  file: GlobalItemTypes;
  data: GlobalItemTypes[];
  selectedFiles: GlobalItemTypes[];
}

const File: FunctionComponent<IFileProps> = (props) => {
  const { file, providerId, selectedFiles, data } = props;

  const isActive = useMemo(
    () => selectedFiles.find((f) => f.id === file.id),
    [file.id, selectedFiles]
  );

  const addSelectedFile = useSelectedFiles((state) => state.addFile);
  const replaceAllSelectedFiles = useSelectedFiles(
    (state) => state.replaceAllFiles
  );

  const onDragStart = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify(useSelectedFiles.getState().files)
    );
  }, []);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.shiftKey) {
      if (!selectedFiles.length) {
        console.log("No files selected");
        return;
      }

      let firstSelectedFileIndex = data.findIndex(
        (f) => f.id === selectedFiles[0].id
      );
      let lastSelectedFileIndex = data.findIndex((f) => f.id === file.id);

      if (firstSelectedFileIndex > lastSelectedFileIndex) {
        const temp = firstSelectedFileIndex;
        firstSelectedFileIndex = lastSelectedFileIndex;
        lastSelectedFileIndex = temp;
      }

      const files = data
        .slice(firstSelectedFileIndex, lastSelectedFileIndex + 1)
        .map((f) => ({ providerId, ...f }));
      replaceAllSelectedFiles(files);
    } else if (event.ctrlKey || event.metaKey) {
      addSelectedFile({ ...file, providerId });
    } else {
      replaceAllSelectedFiles({ ...file, providerId });
    }
  }

  function onDoubleClick() {
    window.open(file.webUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      draggable
      type="button"
      onClick={onClick}
      data-id={file.id}
      id={`file-${file.id}`}
      onDragStart={onDragStart}
      onDoubleClick={onDoubleClick}
      className={classNames(
        "py-1 px-2 h-[200px] rounded-lg relative overflow-hidden focus:outline-none bg-indigo-50/60 hover:bg-indigo-100/50 focus:bg-indigo-100/90",
        isActive ? "bg-indigo-100/90" : "bg-indigo-50/60"
      )}
    >
      <div className="w-full flex items-center p-2" data-id={file.id}>
        <div className="w-5 flex-shrink-0 mr-1.5" data-id={file.id}>
          <Image
            width={500}
            height={500}
            alt={file.name}
            data-id={file.id}
            src={file.iconLink}
          />
        </div>
        <span
          data-id={file.id}
          className="text-gray-700 font-medium text-xs text-ellipsis overflow-hidden whitespace-nowrap"
        >
          {file.name}
        </span>
      </div>

      <div
        data-id={file.id}
        className="w-full h-[70%] mx-auto flex items-center justify-center"
      >
        {file.image ? (
          <div
            data-id={file.id}
            className="w-full h-full flex items-center justify-center"
          >
            {/* <div className="w-16 h-full flex items-center justify-center"> */}
            <Image
              src={file.image}
              width={1000}
              height={1000}
              loading="lazy"
              alt={file.name}
              onError={(event) => {
                const parent = event.currentTarget.parentElement;
                event.currentTarget.srcset =
                  "/_next/image?url=%2Ficons%2FFILE.webp&w=640&q=75 1x, /_next/image?url=%2Ficons%2FFILE.webp&w=1080&q=75 2x";

                event.currentTarget.classList.remove("object-cover");

                parent?.classList.remove("w-full", "h-full");
                parent?.classList.add("w-16");
              }}
              className="rounded-md object-cover object-center w-full h-full"
            />
          </div>
        ) : (
          <div data-id={file.id} className="-mt-5 w-16">
            <Image
              src={file.iconLink}
              width={500}
              height={500}
              alt={file.name}
            />
          </div>
        )}
      </div>
    </button>
  );
};

export default File;
