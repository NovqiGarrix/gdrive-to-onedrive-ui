import { FunctionComponent, useEffect, useRef } from "react";
import { shallow } from "zustand/shallow";

import useBeforeUnload from "../hooks/useBeforeUnload";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

import FilesContainer from "./FilesContainer";
import DeleteFilesModal from "./DeleteFilesModal";

const FilesContainerWrapper: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  const selectedFiles = useSelectedFiles((s) => s.files, shallow);
  const cleanSelectedFiles = useSelectedFiles((s) => s.cleanFiles);
  const uploadInfoProgress = useUploadInfoProgress(
    (s) => s.uploadInfoProgress,
    shallow
  );

  useBeforeUnload(() => {
    uploadInfoProgress.forEach(({ abortController }) => {
      abortController.abort();
    });
  });

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const fileOptionsEl = document.getElementById("file-options");

      const shouldClean =
        !target.hasAttribute("data-id") && !fileOptionsEl?.contains(target);
      if (!shouldClean || !selectedFiles.length) return;
      cleanSelectedFiles();
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [cleanSelectedFiles, selectedFiles.length]);

  return (
    <div ref={ref} id="files-container-wrapper" className="w-full">
      <FilesContainer />
      <DeleteFilesModal />
    </div>
  );
};

export default FilesContainerWrapper;
