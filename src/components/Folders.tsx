import { FunctionComponent, useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

import FolderIcon from "../icons/FolderIcon";
import type { GlobalItemTypes } from "../types";

import useGetFolders from "../hooks/useGetFolders";
import useProviderPath from "../hooks/useProviderPath";
import useCloudProvider from "../hooks/useCloudProvider";

import LoadingIcon from "./LoadingIcon";
import classNames from "../utils/classNames";

const Folders: FunctionComponent = () => {
  const router = useRouter();

  const path = useProviderPath((s) => s.path);
  const setPath = useProviderPath((s) => s.setPath);

  const provider = useCloudProvider((s) => s.provider, shallow);
  const enabled = provider.id !== "google_photos";

  const folderContainerRef = useRef<HTMLDivElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<GlobalItemTypes | null>(
    null
  );

  const { isLoading, isError, error, isFetching, data } =
    useGetFolders(enabled);

  async function onDoubleClick(folder: GlobalItemTypes) {
    const newPath = path
      ? `${path}/${folder.name}~${folder.id}`
      : `/${folder.name}~${folder.id}`;

    const urlParams = new URLSearchParams(
      router.query as Record<string, string>
    );
    urlParams.set("path", newPath);

    await router.push(`/?${urlParams.toString()}`, undefined, {
      shallow: true,
    });
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

  if (!enabled || (!data?.files.length && !isLoading)) return null;

  return (
    <div className="w-full mt-[42px]">
      <div className="flex items-center space-x-3">
        <h2 className="font-medium font-inter text-fontBlack2 text-2xl">
          Folders
        </h2>
        {isFetching ? <LoadingIcon fill="#313132" className="w-4 h-4" /> : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-5 mt-[30px]">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg bg-youngPrimary/60">
                <div className="animate-pulse rounded-[10px] bg-youngPrimary/60 flex items-center p-4">
                  <div className="w-5 h-5 bg-gray-300/80 flex-shrink-0 rounded-full"></div>
                  <div className="ml-4 w-full h-2 bg-gray-300/80 rounded"></div>
                </div>
              </div>
            ))}
        </div>
      ) : isError && error?.message !== "Unauthorized" ? (
        <div className="w-full mt-[30px]">
          <h2 className="text-error text-sm font-medium mb-2 flex items-center space-x-1">
            <p>{error?.message}</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </h2>
        </div>
      ) : (
        <div
          ref={folderContainerRef}
          className="grid grid-cols-5 gap-5 mt-[30px]"
        >
          {data?.files.map((folder) => (
            <button
              type="button"
              key={folder.id}
              onClick={() => setSelectedFolder(folder)}
              onDoubleClick={() => onDoubleClick(folder)}
              className={classNames(
                "rounded-[10px] flex items-center p-4",
                selectedFolder?.id === folder.id
                  ? "bg-primary/20"
                  : "bg-youngPrimary/60 hover:bg-gray-200"
              )}
            >
              <FolderIcon
                width={23}
                height={23}
                fill="#313133"
                className="flex-shrink-0"
              />
              <span className="ml-3 font-inter font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                {folder.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Folders;
