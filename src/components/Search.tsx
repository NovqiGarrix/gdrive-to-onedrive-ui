import { FunctionComponent, Dispatch, SetStateAction } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";

interface ISearchProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

const Search: FunctionComponent<ISearchProps> = (props) => {
  const { searchQuery, setSearchQuery } = props;

  return (
    <div className="w-full">
      <div className="flex items-center group">
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="w-5 h-5 text-bg-2 mr-3 group-focus-within:text-darken transition-all duration-200"
        />
        <input
          type="text"
          role="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="py-3 placeholder:text-bg-2 text-xs font-medium md:text-sm text-dark outline-none w-full flex-grow"
          placeholder="Search files..."
        />
      </div>
    </div>
  );
};

export default Search;
