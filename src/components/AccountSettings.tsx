import { ChangeEvent, FunctionComponent } from "react";

import Image from "next/image";
import { toast } from "react-hot-toast";

import useUser from "../hooks/useUser";

import LinkedAccounts from "./LinkedAccounts";
import userApi from "../apis/user.api";

const AccountSettings: FunctionComponent = () => {
  const username = useUser((s) => s.user.name);
  const profilePicture = useUser((s) => s.user.avatar);

  const setUser = useUser((s) => s.setUser);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();

    toast.loading("Uploading avatar...", { id: "upload-avatar" });

    const file = event.target.files?.item(0);
    if (!file) {
      toast.error("No file selected", { id: "upload-avatar" });
      return;
    }

    try {
      const newAvatar = await userApi.changeAvatar(file);
      setUser({ avatar: newAvatar });

      toast.success("Avatar updated.", { id: "upload-avatar" });
    } catch (error: any) {
      toast.error(error.message, { id: "upload-avatar" });
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 w-full">
      <h1 className="text-2xl font-bold text-gray-600">Account</h1>

      {/* Settings Container */}
      <div className="divide-y divide-gray-200">
        {/* Avatar Section */}
        <div className="pt-3 pb-6 mt-3">
          <h3 className="font-bold text-base text-gray-600">Avatar</h3>
          <div className="flex items-center space-x-5 mt-2">
            <div className="w-14 h-14">
              <Image
                src={profilePicture}
                width={1000}
                height={1000}
                alt={username}
                className="rounded-full object-cover aspect-square"
              />
            </div>

            <div className="relative ml-5">
              <label
                htmlFor="change-avatar"
                className="rounded-md cursor-pointer border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-500 shadow-sm hover:bg-gray-50"
              >
                Change
              </label>
              <input
                type="file"
                multiple={false}
                id="change-avatar"
                onChange={handleAvatarChange}
                className="w-0 h-0 invisible absolute"
                accept="image/png,image/jpeg,image/webp,image/jpg"
              />
            </div>
          </div>
        </div>

        {/* Linked Accounts */}
        <LinkedAccounts />

        {/* Delete Account Section */}
        <div className="pt-4 pb-5 flex items-center justify-between">
          <div className="w-8/12">
            <h3 className="font-bold text-base text-gray-600">
              Delete account
            </h3>
            <p className="text-sm text-gray-400">
              This action is can not be undone. You will not lose any of your
              files.
            </p>
          </div>

          <button
            className="flex-shrink-0 text-sm text-gray-500 hover:text-gray-600"
            type="button"
          >
            Delete account
          </button>
        </div>

        {/*  */}
      </div>
    </div>
  );
};

export default AccountSettings;
