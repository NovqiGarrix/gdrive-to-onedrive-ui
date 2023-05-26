import {
  ChangeEvent,
  Fragment,
  FunctionComponent,
  memo,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/legacy/image";
import { shallow } from "zustand/shallow";
import { Transition, Dialog } from "@headlessui/react";

import classNames from "../utils/classNames";

import useUser from "../hooks/useUser";
import useShowSettingsModal from "../hooks/useShowSettingsModal";

import AccountSettings from "./AccountSettings";

const settings = [
  {
    title: "Accounts",
    Component: () => <AccountSettings />,
  },
];

const Settings: FunctionComponent = () => {
  const { open, setOpen } = useShowSettingsModal((state) => state, shallow);

  const cancelButtonRef = useRef(null);

  const [activeSetting, setActiveSetting] = useState(0);

  const { Component: SettingComponent } = useMemo(
    () => settings[activeSetting],
    [activeSetting]
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-xl transition-all my-8 w-screen max-w-4xl">
                <div className="">
                  {/* Header */}
                  <div
                    className="min-h-[13rem] bg-center brightness-110 bg-no-repeat bg-cover"
                    style={{
                      backgroundImage:
                        "url('https://cdn.discordapp.com/attachments/1064517253703422055/1093780719601459200/Its_Novrii_bright_yellow_clean_wallpapers_with_colorfull_art_8fd23623-aa7e-4a45-af25-9811e9f05b4e.png')",
                    }}
                  ></div>

                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 bg-white min-h-[20rem] relative">
                    <ProfileComponent />

                    <div className="my-28"></div>

                    <div className="flex items-center border-b-2 space-x-5 pb-3">
                      {settings.map((setting, index) => {
                        const isActive = index === activeSetting;

                        return (
                          <button
                            type="button"
                            key={setting.title}
                            onClick={() => setActiveSetting(index)}
                            className={classNames(
                              "relative hover:font-medium group",
                              isActive ? "font-medium" : "font-normal"
                            )}
                          >
                            {setting.title}

                            <div
                              className={classNames(
                                "absolute w-full left-0 -bottom-[13.6px] group-hover:border-b-[3px] transition-all duration-75 group-hover:border-gray-700",
                                isActive ? "border-b-[3px] border-gray-700" : ""
                              )}
                            ></div>
                          </button>
                        );
                      })}
                    </div>

                    <SettingComponent />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Settings;

const ProfileComponent = memo(function ProfileComponent() {
  const user = useUser((s) => s.user, shallow);

  return (
    <div className="flex items-center absolute -top-[3.5rem]">
      <div className="bg-gray-100 group w-40 h-40 relative p-1 rounded-full shadow-lg">
        <Image
          src={user.avatar}
          alt={user.name}
          width={1000}
          height={1000}
          objectFit="cover"
          className="rounded-full"
        />
      </div>

      <div className="ml-[1rem] mt-[3.2rem]">
        <h3 className="font-semibold text-3xl">Settings</h3>
        <p className="text-gray-700 font-medium text-lg">{user.name}</p>
      </div>
    </div>
  );
});
