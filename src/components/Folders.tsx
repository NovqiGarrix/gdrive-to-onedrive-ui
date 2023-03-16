import { useQuery } from "@tanstack/react-query";
import { Dispatch, FunctionComponent, SetStateAction } from "react";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";
import FolderIcon from "../icons/FolderIcon";
import { GetFilesFuncParams, GetFilesReturn, ProviderObject } from "../types";

interface IFoldersProps {
  query: string;
  path: string | undefined;
  setPath: Dispatch<SetStateAction<string | undefined>>;
  provider: ProviderObject;
  getFiles: (params: GetFilesFuncParams) => Promise<GetFilesReturn>;
}

const Folders: FunctionComponent<IFoldersProps> = (props) => {
  const { path, provider, getFiles, setPath, query } = props;

  const { isLoading, isError, error, isFetching, data } = useQuery<
    GetFilesReturn,
    HttpErrorExeption
  >({
    queryFn: () => getFiles({ path, foldersOnly: true, query }),
    queryKey: ["folders", provider.id, path, query],
    retry: false,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: process.env.NODE_ENV === "production",
  });

  function onDoubleClick(folderName: string) {
    setPath(path ? `${path}/${folderName}` : `/${folderName}`);
  }

  if (!data?.files.length) return null;

  return (
    <div className="mt-5 w-full">
      <h2 className="text-dark font-medium mb-2">Folders</h2>

      {isLoading || isFetching ? (
        <div className="grid grid-cols-4 gap-3">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg bg-indigo-50/60">
                <div className="animate-pulse flex items-center p-2.5 space-x-2">
                  <div className="w-5 h-5 bg-gray-400 flex-shrink-0 rounded-full"></div>
                  <div className="w-full h-2 bg-gray-400 rounded"></div>
                </div>
              </div>
            ))}
        </div>
      ) : isError ? (
        <div className="w-full">
          <h2 className="text-error text-sm font-medium mb-2 flex items-center space-x-1">
            <p>{error.message}</p>
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
        <div className="grid grid-cols-4 gap-3">
          {data.files.map((folder) => (
            <button
              type="button"
              key={folder.id}
              onDoubleClick={() => onDoubleClick(folder.name)}
              className="flex items-center p-2.5 space-x-2 rounded-lg bg-indigo-50/60 hover:bg-indigo-100/50 focus:bg-indigo-100/90"
            >
              <FolderIcon
                className="flex-shrink-0"
                fill="rgb(102 110 127 / 1)"
                width={23}
                height={23}
              />
              <span className="text-darken text-ellipsis overflow-hidden whitespace-nowrap group-focus:text-indigo-700 font-medium text-xs">
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
