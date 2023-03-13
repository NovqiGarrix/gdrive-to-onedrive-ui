import { DragEvent, FunctionComponent, MouseEvent, useCallback } from "react";

import Image from "next/image";

import classNames from "../utils/classNames";
import type { GlobalItemTypes, Provider } from "../types";
import useSelectedFiles from "../hooks/useSelectedFiles";

interface IFileProps {
  providerId: Provider;
  file: GlobalItemTypes;
}

const File: FunctionComponent<IFileProps> = (props) => {
  const { file, providerId } = props;

  const addSelectedFile = useSelectedFiles((state) => state.addFile);
  const replaceAllSelectedFiles = useSelectedFiles(
    (state) => state.replaceAllFiles
  );

  const onDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ file, providerId })
      );
    },
    [file, providerId]
  );

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.ctrlKey) {
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
      onDragStart={onDragStart}
      className={classNames(
        "rounded-lg relative border-2 overflow-hidden flex items-center justify-center h-[133px] md:h-[162px] lg:h-[150px] focus:outline-none focus:border-indigo-200 focus:bg-indigo-200/5",
        providerId === "google_photos"
          ? "h-[133px] md:h-[218px] lg:h-[180px]"
          : "h-[133px] md:h-[162px] lg:h-[150px]"
      )}
    >
      {file.image ? (
        <div className="w-full h-full">
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

              event.currentTarget.classList.remove(
                "object-cover",
                "w-full",
                "h-full"
              );

              parent?.classList.remove("w-full", "h-full");
              parent?.classList.add("-mt-5", "w-16");
            }}
            className="rounded-t-md object-cover object-center w-full h-full"
          />
        </div>
      ) : (
        <div className="-mt-5 w-16">
          <Image src={file.iconLink} width={500} height={500} alt={file.name} />
        </div>
      )}
      <div className="w-full absolute rounded-b-md bottom-0 bg-white h-9 md:h-[25%] flex items-center p-3">
        <div className="w-4 flex-shrink-0 mr-1.5">
          <Image src={file.iconLink} width={500} height={500} alt={file.name} />
        </div>
        <span className="text-darken font-medium text-xs text-ellipsis overflow-hidden whitespace-nowrap">
          {file.name}
        </span>
      </div>
    </button>
  );
};

export default File;
