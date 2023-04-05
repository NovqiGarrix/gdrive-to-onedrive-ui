import { FunctionComponent, useMemo } from "react";
import classNames from "../utils/classNames";
import { useRouter } from "next/router";

interface IBreadcrumbsProps {
  path: string | undefined;
  setPath: (path: string | undefined) => void;

  fontSize?: string;
  iconSize?: string;
}

const Breadcrumbs: FunctionComponent<IBreadcrumbsProps> = (props) => {
  const { path, setPath, fontSize = "text-lg", iconSize = "4" } = props;

  const router = useRouter();

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

  async function onPathClick(indexPath: number) {
    const tempPaths = paths;
    tempPaths.splice(indexPath + 1, tempPaths.length - indexPath);

    const newPath =
      tempPaths.length > 0
        ? tempPaths.join("/").replace("Home", "")
        : undefined;

    const urlParams = new URLSearchParams(
      router.query as Record<string, string>
    );

    if (!newPath) urlParams.delete("path");
    else urlParams.set("path", newPath);

    await router.push(`/?${urlParams.toString()}`, undefined, {
      shallow: true,
    });

    setPath(newPath);
  }

  return (
    <div className="mt-[30px]">
      <ul className={classNames("flex flex-wrap items-center", fontSize)}>
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
                  className={`w-${iconSize} h-${iconSize} mr-2 stroke-current`}
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                  className={`w-${iconSize} h-${iconSize} mx-2 flex-shrink-0`}
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
