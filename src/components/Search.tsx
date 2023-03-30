import { FunctionComponent, useEffect, useState } from "react";

import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";

import classNames from "../utils/classNames";

import useSearchQuery from "../hooks/useSearchQuery";
import useGetProviderAccountInfo from "../hooks/useGetProviderAccountInfo";

const Search: FunctionComponent = () => {
  const [isFocus, setIsFocus] = useState(false);

  const query = useSearchQuery((s) => s.query);
  const setQuery = useSearchQuery((s) => s.setQuery);
  const setDebounceQuery = useSearchQuery((s) => s.setDebounceQuery);

  const { data: accountInfo, isLoading } = useGetProviderAccountInfo();

  const isDisabled = !accountInfo?.isConnected || isLoading;

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
    <div
      className={classNames(
        "max-w-3xl w-full border focus-within:shadow-md focus-within:border-none border-[#ECECFD] rounded-[10px] px-[26px] flex items-center bg-white flex-shrink-0",
        isDisabled ? "cursor-not-allowed opacity-70" : "cursor-text opacity-100"
      )}
    >
      {isDisabled ? (
        <ExclamationCircleIcon
          className={classNames(
            "w-[22px] h-[22px]",
            isFocus ? "text-slate-600" : "text-fontGray"
          )}
        />
      ) : (
        <MagnifyingGlassIcon
          className={classNames(
            "w-[22px] h-[22px]",
            isFocus ? "text-slate-600" : "text-fontGray"
          )}
        />
      )}
      <input
        type="text"
        value={query}
        disabled={isDisabled}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          isLoading
            ? "Almost there..."
            : isDisabled
            ? `Please connect your account to ${accountInfo?.name}`
            : "Type anything to search"
        }
        className="ml-[15px] text-slate-600 placeholder:text-fontGray text-base py-[15px] flex-grow focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed bg-transparent"
      />
    </div>
  );
};

export default Search;
