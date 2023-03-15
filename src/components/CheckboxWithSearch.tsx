import {
  ChangeEvent,
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import classNames from "../utils/classNames";
import uppercaseFirstLetter from "../utils/uppercaseFirstLetter";

interface ICheckboxWithSearchProps {
  data: Array<string>;
  inputPlaceholder: string;

  selectedData: Array<string>;
  addSelectedData: (content: string) => void;
  removeSelectedData: (content: string) => void;
}

const CheckboxWithSearch: FunctionComponent<ICheckboxWithSearchProps> = (
  props
) => {
  const {
    data,
    inputPlaceholder,
    addSelectedData,
    removeSelectedData,
    selectedData,
  } = props;

  const inputWrapperRef = useRef<HTMLDivElement>(null);

  const [inputQuery, setInputQuery] = useState("");
  const [inputFocus, setInputFocus] = useState(false);

  const filteredData = useMemo(
    () =>
      (data || []).filter((d) =>
        d.toLowerCase().includes(inputQuery.toLowerCase())
      ),
    [data, inputQuery]
  );

  function onListClick(data: string) {
    const checkbox = document.getElementById(
      `checkbox-${data}`
    ) as HTMLInputElement;

    if (!checkbox) return;
    setInputFocus(true);

    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) {
      addSelectedData(data);
    } else {
      removeSelectedData(data);
    }

    setInputQuery("");
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    setInputQuery(e.target.value);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        setInputFocus(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={inputWrapperRef}>
      <div className="w-full md:max-w-sm lg:max-w-sm mr-3">
        <div className="w-full flex items-center justify-between px-3 border-2 group focus-within:border-dark rounded-lg bg-white py-2.5 md:py-3">
          <div className="flex items-center">
            <div className="mr-2">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-300 group-focus-within:text-dark" />
            </div>
            <input
              type="text"
              value={inputQuery}
              onChange={onInputChange}
              placeholder={
                selectedData.length > 0
                  ? selectedData.map((s) => uppercaseFirstLetter(s)).join(", ")
                  : inputPlaceholder
              }
              onFocus={() => setInputFocus(true)}
              className="flex-grow w-full outline-none font-poppins bg-transparent text-darken text-sm"
            />
          </div>
        </div>
      </div>

      <ul
        className={classNames(
          "absolute top-14 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-56 overflow-auto transition-all duration-300",
          inputFocus ? "opacity-100 z-30" : "opacity-0 -z-30"
        )}
      >
        {filteredData.map((data) => (
          <li
            key={data}
            onBlur={() => setInputFocus(false)}
            onClick={() => onListClick(data)}
            className="w-full flex group items-center justify-between pr-3 hover:bg-indigo-600 py-2 cursor-pointer"
          >
            <p className="text-sm pl-3 text-left w-full group-hover:text-white text-gray-900">
              {uppercaseFirstLetter(data)}
            </p>

            <input
              type="checkbox"
              id={`checkbox-${data}`}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 form-checkbox rounded border-gray-300 text-indigo-600 checked:ring-2 checked:ring-white"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckboxWithSearch;
