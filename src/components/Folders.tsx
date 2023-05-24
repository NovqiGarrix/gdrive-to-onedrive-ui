import {
  Fragment,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import type { GlobalItemTypes } from "../types";

import useGetFolders from "../hooks/useGetFolders";
import useProviderPath from "../hooks/useProviderPath";
import useCloudProvider from "../hooks/useCloudProvider";

import BeautifulError from "./BeautifulError";
import FoldersSkeletonLoading from "./FoldersSkeletonLoading";

const Folder = dynamic(() => import("./Folder"));
const LoadingIcon = dynamic(() => import("./LoadingIcon"));
const DeleteFolderModal = dynamic(() => import("./DeleteFolderModal"));

const Folders: FunctionComponent = () => {
  const router = useRouter();

  const path = useProviderPath((s) => s.path);
  const setPath = useProviderPath((s) => s.setPath);

  const providerId = useCloudProvider((s) => s.provider.id);
  const enabled = providerId !== "google_photos";

  const folderContainerRef = useRef<HTMLDivElement>(null);

  const [openModal, setOpenModal] = useState(false);
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
    setSelectedFolder(null);

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

  useEffect(() => {
    function onDeleteKeydown(event: KeyboardEvent) {
      if (event.key === "Delete" && selectedFolder?.id) {
        console.log('hello from Folders.tsx');
        setOpenModal(true);
      }
    }

    document.addEventListener("keydown", onDeleteKeydown);

    return () => {
      document.removeEventListener("keydown", onDeleteKeydown);
    };
  }, [selectedFolder?.id]);

  if (!enabled || (!data?.files.length && !isLoading)) return null;

  return (
    <Fragment>
      <DeleteFolderModal
        open={openModal}
        setOpen={setOpenModal}
        selectedFolder={selectedFolder}
      />
      <div className="w-full mt-[30px]">
        <div className="flex items-center space-x-3">
          <h2 className="font-medium font-inter text-fontBlack2 text-2xl">
            Folders
          </h2>
          {isFetching ? (
            <LoadingIcon fill="#313132" className="w-4 h-4" />
          ) : null}
        </div>

        {isLoading ? (
          <FoldersSkeletonLoading />
        ) : isError && error?.message !== "Unauthorized" ? (
          <BeautifulError.Root>
            <BeautifulError.Title title="Something went wrong" />
            <BeautifulError.Message
              message={error?.message || "Something went wrong"}
            />
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
    </Fragment>
  );
};

export default Folders;
