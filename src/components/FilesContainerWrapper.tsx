import { FunctionComponent, useEffect, useRef } from "react";

import useBeforeUnload from "../hooks/useBeforeUnload";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useUploadInfoProgress from "../hooks/useUploadInfoProgress";
import useUsedProviders from "../hooks/useUsedProviders";

import FilesContainer from "./FilesContainer";

const FilesContainerWrapper: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  const initialUsedProviders = useUsedProviders((state) =>
    Array.from(state.initialUsedProviders)
  );

  const selectedFiles = useSelectedFiles((s) => s.files);
  const uploadInfoProgress = useUploadInfoProgress((s) => s.uploadInfoProgress);
  const cleanSelectedFiles = useSelectedFiles((s) => s.cleanFiles);

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
    <div
      ref={ref}
      className="flex relative flex-col space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3 lg:divide-x lg:divide-bg"
    >
      {initialUsedProviders.map((provider, index) => (
        <FilesContainer
          key={provider.id}
          componentIndex={index}
          provider={provider.id}
        />
      ))}
    </div>
  );
};

export default FilesContainerWrapper;
