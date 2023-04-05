import { FunctionComponent } from "react";

const FoldersSkeletonLoading: FunctionComponent = () => {
  return (
    <div className="grid grid-cols-5 gap-5 mt-[30px]">
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg bg-youngPrimary/60">
            <div className="animate-pulse rounded-[10px] bg-youngPrimary/60 flex items-center p-4">
              <div className="w-5 h-5 bg-gray-300/80 flex-shrink-0 rounded-full"></div>
              <div className="ml-4 w-full h-2 bg-gray-300/80 rounded"></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default FoldersSkeletonLoading;
