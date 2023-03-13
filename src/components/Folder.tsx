import { Dispatch, FunctionComponent, SetStateAction } from "react";

import FolderIcon from "../icons/FolderIcon";
import type { GlobalItemTypes } from "../types";

interface IFolderProps {
  file: GlobalItemTypes;
  path: string | undefined;
  setPath: Dispatch<SetStateAction<string | undefined>>;
}

const Folder: FunctionComponent<IFolderProps> = (props) => {
  const { file, setPath, path } = props;

  function onDoubleClick() {
    setPath(path ? `${path}/${file.name}` : `/${file.name}`);
  }

  return (
    <button
      type="button"
      onDoubleClick={onDoubleClick}
      className="bg-bg-light p-2 group rounded-lg flex flex-col items-center justify-center space-y-2 h-[133px] md:h-[162px] lg:h-[150px] focus:bg-indigo-100"
      data-tip={file.name}
    >
      <FolderIcon fill="#5f6368" width={25} height={25} />
      <span className="text-darken group-focus:text-indigo-700 font-medium text-xs">
        {file.name}
      </span>
    </button>
  );
};

export default Folder;
