import { FunctionComponent, useEffect, useRef, useState } from "react";

import Link from "next/link";
import Image from "next/legacy/image";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

import type { GlobalItemTypes } from "../types";

import dateFromNow from "../utils/dateFromNow";
import getIconExtensionUrl from "../utils/getIconExtensionUrl";

interface IFileProps {
  file: GlobalItemTypes;
}

const File: FunctionComponent<IFileProps> = (props) => {
  const { file } = props;

  return (
    <div className="mb-2" data-id={file.name}>
      {/* The Image Container */}
      <Link
        passHref
        target="_blank"
        href={file.webUrl}
        data-id={file.name}
        className="bg-[#F4F6F6] flex items-center justify-center rounded-[10px] pt-[15px] px-[15px] h-[230px] overflow-hidden"
      >
        {file.image ? (
          // Do not cache the image in CDN (Privacy concern). That's why we don't use next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={file.name}
            loading="lazy"
            src={file.image}
            data-id={file.name}
            className="object-cover rounded-t-[10px] w-full h-full"
          />
        ) : (
          <Image
            width={50}
            height={50}
            loading="lazy"
            objectFit="contain"
            data-id={file.name}
            alt={`${file.name} icon`}
            className="drop-shadow"
            src={getIconExtensionUrl(file.name, file.mimeType)}
          />
        )}
      </Link>

      <div className="mt-[22px]" data-id={file.name}>
        {/* The filename and the options button */}
        <div className="flex items-center justify-between" data-id={file.name}>
          <Link
            passHref
            target="_blank"
            href={file.webUrl}
            data-id={file.name}
            referrerPolicy="no-referrer"
            className="w-[85%] text-base font-medium font-inter text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {file.name}
          </Link>
          <button type="button" data-id={file.name}>
            <EllipsisHorizontalIcon
              aria-hidden="true"
              data-id={file.name}
              className="w-5 h-5 text-fontBlack flex-shrink-0"
            />
          </button>
        </div>

        <p
          className="mt-3 text-sm font-medium text-[#8B9AB1]"
          data-id={file.name}
        >
          Uploaded {dateFromNow(file.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default File;
