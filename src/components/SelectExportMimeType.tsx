import { Fragment, FunctionComponent, Dispatch, SetStateAction } from "react";

import { useQuery } from "@tanstack/react-query";
import { Listbox, Transition } from "@headlessui/react"
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline"

import classNames from "../utils/classNames"
import type { GoogleDriveSettings } from "../types";
import googledriveApi, { type GetSupportedExportMimeTypesReturn } from "../apis/googledrive.api";

import LoadingIcon from "./LoadingIcon";

interface SelectExportMimeTypeProps {
  selected: GetSupportedExportMimeTypesReturn;
  setSelected: Dispatch<SetStateAction<GetSupportedExportMimeTypesReturn>>;

  label: string;
  mimeType: string;
  userGoogleDriveSettings: GoogleDriveSettings;
}

const SelectExportMimeType: FunctionComponent<SelectExportMimeTypeProps> = (props) => {

  const { selected, setSelected, mimeType, label, userGoogleDriveSettings } = props;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['supported_export_mimeTypes', mimeType],
    queryFn: () => googledriveApi.getSupportedExportMimeTypes(mimeType),

    refetchInterval: Infinity,
    refetchOnWindowFocus: false,

    onSuccess(data) {
      const endOf = mimeType.split(".").pop()!;
      // @ts-ignore - Ignore it
      const selected = data.find((mt) => mt.name === userGoogleDriveSettings[endOf]) || data[0]

      setSelected(selected);
    },

    enabled: !!userGoogleDriveSettings
  });

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">{label}</Listbox.Label>
          <div className="relative mt-2">
            {isError ? (
              <div>
                <p className="text-red-600 text-sm">Failed to load the data. Refresh the page!</p>
              </div>
            ) : isLoading ? (
              <div>
                <LoadingIcon className="w-5 h-5" fill="rgb(17 24 39 / 1)" />
              </div>
            ) : (
              <Fragment>
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                  <span className="block truncate">{selected?.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 max-h-36 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {data?.map((mt) => (
                      <Listbox.Option
                        key={mt.name}
                        className={({ active }) =>
                          classNames(
                            active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                            'relative cursor-default select-none py-2 pl-3 pr-9'
                          )
                        }
                        value={mt}
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex items-center">
                              <span
                                className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                              >
                                {mt.name}
                              </span>
                            </div>

                            {selected ? (
                              <span
                                className={classNames(
                                  active ? 'text-white' : 'text-indigo-600',
                                  'absolute inset-y-0 right-0 flex items-center pr-4'
                                )}
                              >
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </Fragment>
            )}

          </div>
        </>
      )}
    </Listbox>
  )
}

export default SelectExportMimeType;