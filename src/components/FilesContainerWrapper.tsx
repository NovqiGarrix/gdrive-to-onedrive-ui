import { FunctionComponent, useRef } from "react";
import dynamic from "next/dynamic";

import FilesContainer from "./FilesContainer";

const DeleteFilesModal = dynamic(() => import("./DeleteFilesModal"));
const UnConnectedTransferModal = dynamic(() => import("./UnConnectedTransferModal"));

const FilesContainerWrapper: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="w-full">
      <DeleteFilesModal />
      <UnConnectedTransferModal />
      <FilesContainer />
    </div>
  );
};

export default FilesContainerWrapper;
