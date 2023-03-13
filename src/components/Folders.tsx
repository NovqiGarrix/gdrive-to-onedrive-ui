import { FunctionComponent } from "react";

import { GlobalItemTypes } from "../types";
import Folder from "./Folder";

interface IFoldersProps {
  folders: Array<GlobalItemTypes>;
}

const Folders: FunctionComponent<IFoldersProps> = (props) => {
  const { folders: files } = props;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {files?.map((folder) => (
        <Folder label={folder.name} key={folder.id} />
      ))}
    </div>
  );
};

export default Folders;
