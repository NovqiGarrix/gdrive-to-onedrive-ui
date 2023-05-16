import { FunctionComponent, useRef } from "react";
import dynamic from "next/dynamic";

import FilesContainer from "./FilesContainer";

const DeleteFilesModal = dynamic(() => import("./DeleteFilesModal"));

const FilesContainerWrapper: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="w-full">
      <FilesContainer />
      <DeleteFilesModal />
    </div>
  );
};

export default FilesContainerWrapper;
