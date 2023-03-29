import { FunctionComponent } from "react";

import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { BellIcon } from "@heroicons/react/24/outline";

import authApi from "../apis/auth.api";
import useUser from "../hooks/useUser";

import Search from "./Search";

const Navbar: FunctionComponent = () => {
  const router = useRouter();

  const user = useUser((state) => state.user);

  async function logout() {
    try {
      await authApi.logout();
      await router.replace("/login");
    } catch (error) {
      router.reload();
    }
  }

  return (
    <div className="w-full flex items-center">
      <Search />

      <div className="flex items-center ml-[42px] w-full">
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
            className="focus:outline-none text-sm"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
