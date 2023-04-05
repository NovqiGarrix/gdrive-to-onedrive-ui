import { FunctionComponent, useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";
import type { GlobalItemTypes } from "../types";

import useGetFolders from "../hooks/useGetFolders";
import useProviderPath from "../hooks/useProviderPath";
import useCloudProvider from "../hooks/useCloudProvider";

import Folder from "./Folder";
import LoadingIcon from "./LoadingIcon";
import BeautifulError from "./BeautifulError";
import FoldersSkeletonLoading from "./FoldersSkeletonLoading";

const Folders: FunctionComponent = () => {
  const router = useRouter();

  const path = useProviderPath((s) => s.path);
  const setPath = useProviderPath((s) => s.setPath);

  const providerId = useCloudProvider((s) => s.provider.id);
  const enabled = providerId !== "google_photos";

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
    <div className="w-full mt-[30px]" id="folders-container">
      <div className="flex items-center space-x-3">
        <h2 className="font-medium font-inter text-fontBlack2 text-2xl">
          Folders
        </h2>
        {isFetching ? <LoadingIcon fill="#313132" className="w-4 h-4" /> : null}
      </div>

      {isLoading ? (
        <FoldersSkeletonLoading />
      ) : isError && error?.message !== "Unauthorized" ? (
        <BeautifulError.Root>
          <BeautifulError.Title title="Something went wrong" />
          <BeautifulError.Message message={error.message} />
        </BeautifulError.Root>
      ) : (
        <div
          ref={folderContainerRef}
          className="grid grid-cols-5 gap-5 mt-[30px]"
        >
          {data?.files.map((folder) => (
            <Folder
              key={folder.id}
              folder={folder}
              onDoubleClick={onDoubleClick}
              selectedFolder={selectedFolder}
              setSelectedFolder={setSelectedFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Folders;
