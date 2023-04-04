import { FunctionComponent, MouseEvent } from "react";

import Link from "next/link";
import Image from "next/legacy/image";

import { shallow } from "zustand/shallow";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

import type { GlobalItemTypes } from "../types";

import dateFromNow from "../utils/dateFromNow";
import getIconExtensionUrl from "../utils/getIconExtensionUrl";
import classNames from "../utils/classNames";
import useSelectedFiles from "../hooks/useSelectedFiles";

interface IFileProps {
  file: GlobalItemTypes;
  files: Array<GlobalItemTypes>;
}

const File: FunctionComponent<IFileProps> = (props) => {
  const { file, files } = props;

  const isSelected = useSelectedFiles((s) => s.has(file.id));
  const selectedFiles = useSelectedFiles((s) => s.files, shallow);

  const addSelectedFile = useSelectedFiles((s) => s.addFile);
  const replaceAllSelectedFiles = useSelectedFiles((s) => s.replaceAllFiles);

  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (event.shiftKey) {
      if (!selectedFiles.length) {
        console.log("No files selected");
        return;
      }

      let firstSelectedFileIndex = files.findIndex(
        (f) => f.id === selectedFiles[0].id
      );
      let lastSelectedFileIndex = files.findIndex((f) => f.id === file.id);

      if (firstSelectedFileIndex > lastSelectedFileIndex) {
        const temp = firstSelectedFileIndex;
        firstSelectedFileIndex = lastSelectedFileIndex;
        lastSelectedFileIndex = temp;
      }

      const slicedFiles = files
        .slice(firstSelectedFileIndex, lastSelectedFileIndex + 1)
        .map((f) => ({ ...f, providerId: f.from }));
      replaceAllSelectedFiles(slicedFiles);
    } else if (event.ctrlKey || event.metaKey) {
      addSelectedFile(file);
    } else {
      replaceAllSelectedFiles(file);
    }
  }

  function onDoubleClick() {
    window.open(file.webUrl, "_blank");
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className="mb-2"
      data-id={file.id}
    >
      {/* The Image Container */}
      <a
        href={file.webUrl}
        onClick={(event) => {
          event.preventDefault();
        }}
        data-id={file.id}
        className={classNames(
          "bg-[#F4F6F6] flex items-center justify-center rounded-[10px] pt-[15px] px-[15px] h-[230px] overflow-hidden",
          isSelected ? "bg-youngPrimary" : "bg-[#F4F6F6]"
        )}
      >
        {file.image ? (
          <Image
            alt={file.name}
            loading="lazy"
            src={file.image}
            data-id={file.id}
            objectFit="cover"
            width={1000}
            height={1000}
            className="rounded-t-[10px] w-full h-full"
          />
        ) : (
          <Image
            width={50}
            height={50}
            loading="lazy"
            objectFit="contain"
            data-id={file.id}
            alt={`${file.name} icon`}
            className="drop-shadow"
            src={getIconExtensionUrl(file.name, file.mimeType)}
          />
        )}
      </a>

      <div className="mt-[22px]" data-id={file.id}>
        {/* The filename and the options button */}
        <div className="flex items-center justify-between" data-id={file.id}>
          <Link
            passHref
            target="_blank"
            href={file.webUrl}
            data-id={file.id}
            referrerPolicy="no-referrer"
            className="w-[85%] text-left text-base font-medium font-inter text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {file.name}
          </Link>
          <button type="button" data-id={file.id}>
            <EllipsisHorizontalIcon
              aria-hidden="true"
              data-id={file.id}
              className="w-5 h-5 text-fontBlack flex-shrink-0"
            />
          </button>
        </div>

        <p
          className="mt-3 text-sm text-left font-medium text-[#8B9AB1]"
          data-id={file.id}
        >
          Uploaded {dateFromNow(file.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default File;
