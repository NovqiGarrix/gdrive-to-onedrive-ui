import { DragEvent, FunctionComponent, useState } from "react";
import LoadingIcon from "./LoadingIcon";

const UploadArea: FunctionComponent = () => {
  const [isDragOver, setIsDragOver] = useState(false);

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragOver(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragOver(false);
  }

  async function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
  }

  return (
    <section className="w-full mt-[50px]">
      <h2 className="font-medium font-inter text-2xl">Upload Files</h2>
      {/* Droparea */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className="mt-[30px] h-[250px] bg-[#F5F8FC] border border-dashed border-primary rounded-[10px] flex items-center justify-center flex-col"
      >
        <div className="p-2 rounded-full bg-youngPrimary">
          {isDragOver ? (
            <LoadingIcon className="w-5 h-5" fill="#2F80ED" />
          ) : (
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_2_353)">
                <path
                  d="M16.6667 16.6667L12.5 12.5L8.33337 16.6667"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.5 12.5V21.875"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.2396 19.1563C22.2556 18.6024 23.0582 17.7259 23.5207 16.6652C23.9833 15.6046 24.0794 14.42 23.794 13.2986C23.5086 12.1772 22.8578 11.1828 21.9445 10.4723C21.0311 9.76186 19.9072 9.37577 18.75 9.375H17.4375C17.1222 8.15546 16.5346 7.02327 15.7187 6.06354C14.9029 5.10381 13.8801 4.34151 12.7272 3.83397C11.5743 3.32642 10.3214 3.08684 9.06264 3.13321C7.80386 3.17959 6.57196 3.51073 5.45958 4.10174C4.34719 4.69274 3.38326 5.52824 2.64025 6.5454C1.89724 7.56257 1.39449 8.73494 1.16979 9.97437C0.945092 11.2138 1.0043 12.4881 1.34295 13.7013C1.6816 14.9146 2.2909 16.0353 3.12502 16.9792"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6667 16.6667L12.5 12.5L8.33337 16.6667"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_2_353">
                  <rect width="25" height="25" fill="white" />
                </clipPath>
              </defs>
            </svg>
          )}
        </div>

        <h5 className="mt-[23px] font-inter font-medium text-base">
          Drag and drop files, or{" "}
          <label
            htmlFor="upload-file-input"
            className="text-primary cursor-pointer"
          >
            Browse
          </label>
        </h5>
        <input
          type="file"
          id="upload-file-input"
          className="w-0 h-0 invisible -z-50"
        />
        <p className="font-medium mt-2 text-sm text-fontGray">
          Support zip, rar and even folder
        </p>
      </div>
    </section>
  );
};

export default UploadArea;
