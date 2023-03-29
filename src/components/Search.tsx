import { FunctionComponent, useEffect, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";

import useSearchQuery from "../hooks/useSearchQuery";
import classNames from "../utils/classNames";

const Search: FunctionComponent = () => {
  const [isFocus, setIsFocus] = useState(false);

  const query = useSearchQuery((s) => s.query);
  const setQuery = useSearchQuery((s) => s.setQuery);
  const setDebounceQuery = useSearchQuery((s) => s.setDebounceQuery);

  useEffect(() => {
    if (query === "") {
      setDebounceQuery("");
    }

    const timer = setTimeout(() => {
      setDebounceQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, setDebounceQuery]);

  return (
    <div className="max-w-3xl w-full border focus-within:shadow-md focus-within:border-none border-[#ECECFD] rounded-[10px] px-[26px] flex items-center bg-white flex-shrink-0">
      <MagnifyingGlassIcon
        className={classNames(
          "w-[22px] h-[22px]",
          isFocus ? "text-slate-600" : "text-fontGray"
        )}
      />
      <input
        type="text"
        value={query}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type anything to search"
        className="ml-[15px] text-slate-600 placeholder:text-fontGray text-base py-[15px] flex-grow focus:outline-none"
      />
    </div>
  );
};

export default Search;
