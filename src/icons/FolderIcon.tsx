import { FunctionComponent } from "react";
import classNames from "../utils/classNames";

interface IFolderIconProps {
  fill?: string;
  width?: number;
  height?: number;
  className?: string;
}

const FolderIcon: FunctionComponent<IFolderIconProps> = (props) => {
  const { fill = "#fff", width = 24, height = 24, className = "" } = props;

  return (
    <svg
      height={height}
      width={width}
      focusable="false"
      viewBox="0 0 24 24"
      fill={fill}
      className={classNames(className)}
    >
      <g>
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path>
        <path d="M0 0h24v24H0z" fill="none"></path>
      </g>
    </svg>
  );
};

export default FolderIcon;
