import { FunctionComponent, useRef } from "react";
import { shallow } from "zustand/shallow";

import useBeforeUnload from "../hooks/useBeforeUnload";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

import FilesContainer from "./FilesContainer";
import DeleteFilesModal from "./DeleteFilesModal";

const FilesContainerWrapper: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  const uploadInfoProgress = useUploadInfoProgress(
    (s) => s.uploadInfoProgress,
    shallow
  );

  useBeforeUnload(() => {
    uploadInfoProgress.forEach(({ abortController }) => {
      abortController.abort();
    });
  });

  return (
    <div ref={ref} className="w-full">
      <FilesContainer />
      <DeleteFilesModal />
    </div>
  );
};

export default FilesContainerWrapper;
