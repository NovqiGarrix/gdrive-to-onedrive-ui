import { FunctionComponent, useEffect, useRef } from "react";

import useBeforeUnload from "../hooks/useBeforeUnload";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useCloudProvider from "../hooks/useCloudProvider";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";

import FilesContainer from "./FilesContainer";

const FilesContainerWrapper: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  const cloudProvider = useCloudProvider((s) => s.provider);

  const selectedFiles = useSelectedFiles((s) => s.files);
  const cleanSelectedFiles = useSelectedFiles((s) => s.cleanFiles);
  const uploadInfoProgress = useUploadInfoProgress((s) => s.uploadInfoProgress);

  useBeforeUnload(() => {
    uploadInfoProgress.forEach(({ abortController }) => {
      abortController.abort();
    });
  });

  useEffect(() => {
    const el = ref.current;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      let shouldClean = !target.hasAttribute("data-id");

      if (target.nodeName === "IMG") {
        const parentEl = target.parentElement;
        const parentElOfParentEl = parentEl?.parentElement;
        const parentElOfParentElOfParentEl = parentElOfParentEl?.parentElement;

        shouldClean = !parentElOfParentElOfParentEl?.id.startsWith("file-");
      }

      if (!shouldClean || !selectedFiles.length) return;
      cleanSelectedFiles();
    };

    el?.addEventListener("mousedown", handleMouseDown);

    return () => {
      el?.removeEventListener("mousedown", handleMouseDown);
    };
  }, [cleanSelectedFiles, selectedFiles.length]);

  return (
    <div ref={ref} className="w-full">
      <FilesContainer provider={cloudProvider.id} />
    </div>
  );
};

export default FilesContainerWrapper;
