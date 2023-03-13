import { Dispatch, FunctionComponent, SetStateAction, useMemo } from "react";

interface IBreadcrumbsProps {
  path: string | undefined;
  setPath: Dispatch<SetStateAction<string | undefined>>;
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
        ? tempPaths.join("/").replaceAll("Home", "")
        : undefined;
    setPath(newPath);
  }

  return (
    <div className="text-sm breadcrumbs mt-3">
      <ul>
        {paths.map((path, index) => (
          <li key={path}>
            <button
              type="button"
              onClick={() => onPathClick(index)}
              className="flex cursor-pointer items-center focus:outline-2 focus:outline focus:outline-transparent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-4 h-4 mr-2 stroke-current"
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Breadcrumbs;
