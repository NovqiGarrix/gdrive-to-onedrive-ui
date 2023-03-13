import {
  FunctionComponent,
  Fragment,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

import Image from "next/image";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import type { Provider, ProviderObject } from "../types";
import { PROVIDERS } from "../constants";
import classNames from "../utils/classNames";
import useUsedProviders from "../hooks/useUsedProviders";

interface ISelectProviderProps {
  provider: ProviderObject;
  onChange: (provider: ProviderObject) => void;
}

const SelectProvider: FunctionComponent<ISelectProviderProps> = (props) => {
  const { provider: selected, onChange } = props;

  const usedProviders = useUsedProviders((state) => state.getProviders)();

  return (
    <Listbox value={selected} onChange={onChange}>
      {({ open }) => (
        <>
          <div className="relative w-full max-w-[15rem]">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                <div className="avatar">
                  <div className="w-5">
                    <Image
                      src={selected.image}
                      alt={selected.name}
                      width={500}
                      height={500}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>
                <span className="ml-3 block truncate">{selected.name}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {PROVIDERS.map((p) => (
                  <Listbox.Option
                    key={p.id}
                    // Disable if the provider is already used
                    // But allow to select the current active provider
                    disabled={usedProviders.includes(p) && p.id !== selected.id}
                    className={({ active, disabled }) =>
                      classNames(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9",
                        disabled
                          ? "bg-transparent opacity-70 cursor-not-allowed disabled"
                          : ""
                      )
                    }
                    value={p}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <div className="avatar">
                            <div className="w-5">
                              <Image
                                src={p.image}
                                alt={p.name}
                                width={500}
                                height={500}
                                className="flex-shrink-0"
                              />
                            </div>
                          </div>
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            {p.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
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
          </div>
        </>
      )}
    </Listbox>
  );
};

export default SelectProvider;
