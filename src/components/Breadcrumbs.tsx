import { FunctionComponent, useMemo } from "react";

interface IBreadcrumbsProps {
  path: string | undefined;
  setPath: (path: string | undefined) => void;
}

const Breadcrumbs: FunctionComponent<IBreadcrumbsProps> = (props) => {
  const { path, setPath } = props;
  const paths = useMemo(() => {
    if (path) {
      const splittedPaths = path.split("/");

      // Remove first empty string
      splittedPaths.shift();

      // Add "Home" as first path
      splittedPaths.unshift("Home");

      return splittedPaths;
    }

    return ["Home"];
  }, [path]);

  function onPathClick(indexPath: number) {
    const tempPaths = paths;
    tempPaths.splice(indexPath + 1, tempPaths.length - indexPath);

    const newPath =
      tempPaths.length > 0
        ? tempPaths.join("/").replace("Home", "")
        : undefined;
    setPath(newPath);
  }

  return (
    <div className="mt-[50px]">
      <ul className="text-lg flex flex-wrap items-center">
        {paths
          .map((path) => path.split("~")[0])
          .map((path, index) => (
            <li key={path} className="flex items-center">
              <button
                type="button"
                onClick={() => onPathClick(index)}
                className="flex cursor-pointer items-center focus:outline-2 focus:outline focus:outline-transparent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 mr-2 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  ></path>
                </svg>
                {path}
              </button>

              {index !== paths.length - 1 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 mx-2 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
