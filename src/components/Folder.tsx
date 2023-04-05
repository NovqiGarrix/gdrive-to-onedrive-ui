import { Dispatch, FunctionComponent, SetStateAction } from "react";

import FolderIcon from "../icons/FolderIcon";
import classNames from "../utils/classNames";
import type { GlobalItemTypes } from "../types";

interface IFolderProps {
  folder: GlobalItemTypes;
  onDoubleClick: (folder: GlobalItemTypes) => void;

  selectedFolder: GlobalItemTypes | null;
  setSelectedFolder: Dispatch<SetStateAction<GlobalItemTypes | null>>;
}

const Folder: FunctionComponent<IFolderProps> = (props) => {
  const { folder, onDoubleClick, selectedFolder, setSelectedFolder } = props;

  return (
    <button
      type="button"
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
  );
};

export default Folder;
