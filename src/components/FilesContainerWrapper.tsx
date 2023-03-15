import { FunctionComponent, useEffect, useRef } from "react";

import useSelectedFiles from "../hooks/useSelectedFiles";
import useUsedProviders from "../hooks/useUsedProviders";

import FilesContainer from "./FilesContainer";

const FilesContainerWrapper: FunctionComponent = () => {
  const ref = useRef<HTMLDivElement>(null);

  const initialUsedProviders = useUsedProviders(
    (state) => state.getInitialProviders
  )();

  const selectedFiles = useSelectedFiles((s) => s.files);
  const cleanSelectedFiles = useSelectedFiles((s) => s.cleanFiles);

  useEffect(() => {
    const el = ref.current;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      let shouldClean = !target.id.startsWith("file-");

      if (target.nodeName === "IMG" || target.nodeName === "SPAN") {
        const parentEl = target.parentElement;
        const parentElOfParentEl = parentEl?.parentElement;

        shouldClean = !parentElOfParentEl?.id.startsWith("file-");
      } else if (target.nodeName === "DIV") {
        const parentEl = target.parentElement;
        shouldClean = !parentEl?.id.startsWith("file-");
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
      className="flex flex-col space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3 lg:divide-x lg:divide-bg"
    >
      {initialUsedProviders.map((provider) => (
        <FilesContainer key={provider.id} provider={provider.id} />
      ))}
    </div>
  );
};

export default FilesContainerWrapper;
