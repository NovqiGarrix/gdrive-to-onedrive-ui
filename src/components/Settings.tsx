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
import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { Transition, Dialog } from "@headlessui/react";
import Cog6ToothIcon from "@heroicons/react/24/outline/Cog6ToothIcon";

import userApi from "../apis/user.api";
import classNames from "../utils/classNames";

import useUser from "../hooks/useUser";
import useShowSettingsModal from "../hooks/useShowSettingsModal";

import AccountSettings from "./AccountSettings";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import LoadingIcon from "./LoadingIcon";

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

  const setUser = useUser((s) => s.setUser);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();

    const file = event.target.files?.item(0);
    if (!file) {
      toast.error("No file selected", { id: "upload-avatar" });
      return;
    }

    const newAvatar = await userApi.changeAvatar(file);
    setUser({ avatar: newAvatar });
  }

  const { mutateAsync, isLoading } = useMutation({
    mutationKey: [user.id, "change-avatar"],
    mutationFn: handleAvatarChange,
  });

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

        <label
          htmlFor="change-avatar"
          className={classNames(
            "absolute top-[2px] left-[2px] rounded-full w-[156px] h-[156px] group-hover:opacity-40 group-hover:z-10 bg-gray-600",
            isLoading
              ? "cursor-not-allowed opacity-40 z-10"
              : "cursor-pointer opacity-0 -z-10"
          )}
        >
          <input
            type="file"
            id="change-avatar"
            disabled={isLoading}
            onChange={(event) => {
              toast.promise(mutateAsync(event), {
                loading: "Uploading...",
                success: <b>Done.</b>,
                error: <b>Something went wrong</b>,
              });
            }}
            className="w-0 h-0 opacity-0"
          />
        </label>

        <label
          htmlFor="change-avatar"
          className={classNames(
            "absolute w-10 h-10 rounded-full group-hover:z-20 group-hover:opacity-100 p-2 bg-gray-100 inset-1/2 -translate-x-1/2 -translate-y-1/2",
            isLoading
              ? "cursor-not-allowed opacity-100 z-20"
              : "cursor-pointer opacity-0 -z-10"
          )}
        >
          {isLoading ? (
            <LoadingIcon className="w-full h-full" fill="rgb(31 41 55 / 1)" />
          ) : (
            <PencilSquareIcon className="w-full h-full text-gray-800" />
          )}
        </label>
      </div>

      <div className="ml-[1rem] mt-[3.2rem]">
        <h3 className="font-semibold text-3xl">Settings</h3>
        <p className="text-gray-700 font-medium text-lg">{user.name}</p>
      </div>
    </div>
  );
});
