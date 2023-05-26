import { FunctionComponent } from "react";

import dynamic from "next/dynamic";
import Image from "next/legacy/image";
import { useRouter } from "next/router";

import { shallow } from "zustand/shallow";
import { useMutation } from "@tanstack/react-query";
import BellIcon from "@heroicons/react/24/outline/BellIcon";

import authApi from "../apis/auth.api";
import classNames from "../utils/classNames";

import useUser from "../hooks/useUser";
import useCloudProvider from "../hooks/useCloudProvider";

import Search from "./Search";

const LoadingIcon = dynamic(() => import("./LoadingIcon"));
const GooglePhotosFilter = dynamic(() => import("./GooglePhotosFilter"));

const Navbar: FunctionComponent = () => {
  const router = useRouter();

  const user = useUser((state) => state.user, shallow);
  const provider = useCloudProvider((s) => s.provider, shallow);

  async function logout() {
    try {
      await authApi.logout();
      await router.replace("/signin");
    } catch (error) {
      router.reload();
    }
  }

  const { isLoading: isLoggingOut, mutate: logUserOut } = useMutation({
    mutationKey: ['logout'],
    mutationFn: logout
  });

  return (
    <div
      className={classNames(
        "w-full flex",
        provider.id !== "google_photos" ? "items-center" : "items-start"
      )}
    >
      {provider.id !== "google_photos" ? <Search /> : <GooglePhotosFilter />}

      <div className="flex items-center ml-[42px] max-w-[30%] w-full">
        <button type="button" className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-purple absolute -top-1 -right-2"></div>
          <BellIcon className="w-7 h-7 text-fontBlack" aria-hidden="true" />
        </button>

        {/* User Profile and Name, with Logout button */}
        <div className="flex items-center justify-between w-full ml-8">
          {/* User Profile and Name */}
          <div className="flex items-center">
            <div className="w-[45px] flex-shrink-0 h-[45px]">
              <Image
                width={500}
                height={500}
                src={user.avatar}
                objectFit="cover"
                alt={`${user.name} profile picture`}
                className="rounded-full"
              />
            </div>

            <h4 className="ml-4 font-medium text-base text-fontBlack">
              {user.name}
            </h4>
          </div>

          {/* Logout */}
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => logUserOut()}
            className="flex items-center space-x-3 focus:outline-none text-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>Sign Out</span>
            {isLoggingOut ? (
              <LoadingIcon fill="rgb(15 23 42 / 1)" className="w-5 h-5" />
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
