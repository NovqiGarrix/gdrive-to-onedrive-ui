import { FunctionComponent } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

const FileSkeletonLoading: FunctionComponent = () => {
  return (
    <div className="animate-pulse">
      {/* The Image Container */}
      <div className="bg-[#F4F6F6] rounded-[10px] pt-[15px] px-[15px] h-[230px]"></div>

      <div className="mt-[22px]">
        {/* The filename and the options button */}
        <div className="flex items-center justify-between">
          <div className="w-10/12 h-2 rounded bg-gray-300/80"></div>
          <EllipsisHorizontalIcon className="w-5 h-5 text-fontBlack flex-shrink-0" />
        </div>

        <p className="mt-4 w-1/2 h-2 rounded bg-gray-200"></p>
      </div>
    </div>
  );
};

export default FileSkeletonLoading;
