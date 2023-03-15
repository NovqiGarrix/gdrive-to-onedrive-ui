import {
  Dispatch,
  DragEvent,
  FunctionComponent,
  MouseEvent,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";

import Image from "next/image";

import classNames from "../utils/classNames";
import type { GlobalItemTypes, Provider } from "../types";
import useSelectedFiles from "../hooks/useSelectedFiles";

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

  return (
    <button
      draggable
      type="button"
      onClick={onClick}
      id={`file-${file.id}`}
      data-file={true}
      onDragStart={onDragStart}
      className={classNames(
        "py-1 px-2 h-[200px] rounded-lg relative overflow-hidden focus:outline-none bg-indigo-50/60 hover:bg-indigo-100/50 focus:bg-indigo-100/90",
        isActive ? "bg-indigo-100/90" : "bg-indigo-50/60"
      )}
    >
      <div className="w-full flex items-center p-2">
        <div className="w-5 flex-shrink-0 mr-1.5">
          <Image src={file.iconLink} width={500} height={500} alt={file.name} />
        </div>
        <span className="text-gray-700 font-medium text-xs text-ellipsis overflow-hidden whitespace-nowrap">
          {file.name}
        </span>
      </div>

      <div className="w-full h-[70%] mx-auto flex items-center justify-center">
        {file.image ? (
          <div className="w-full h-full flex items-center justify-center">
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
          <div className="-mt-5 w-16">
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
