import { FunctionComponent } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import Cog8ToothIcon from "@heroicons/react/24/outline/Cog8ToothIcon";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";

import authApi from "../apis/auth.api";
import useUser from "../hooks/useUser";
import { PowerIcon } from "@heroicons/react/24/outline";

interface INavbarProps {}

const Navbar: FunctionComponent<INavbarProps> = () => {
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
    <div className="navbar px-7 md:px-8 lg:px-20 pt-4 bg-transparent">
      {/* Left */}
      <div className="navbar-start">
        <div className="hidden lg:block">
          <Link passHref href="/" className="text-darken text-xl mr-6">
            infile.io
          </Link>
          <ul className="menu menu-horizontal px-1 space-x-2 text-darken">
            <li>
              <Link passHref href="/">
                Homepage
              </Link>
            </li>
            <li>
              <Link passHref href="/about">
                About
              </Link>
            </li>
            <li>
              <Link passHref href="/policy">
                User Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="dropdown lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a>Homepage</a>
            </li>
            <li>
              <a>About</a>
            </li>
            <li>
              <a>User Policy</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-end space-x-3">
        {/* Quick Command Input */}
        <div className="hidden md:w-full md:block md:max-w-sm lg:max-w-sm mr-3">
          <div className="w-full flex items-center justify-between px-3 md:px-5 cursor-pointer rounded-lg bg-white hover:bg-bg-light duration-50 transition-all py-2.5 md:py-3 hover:shadow">
            <div className="flex items-center">
              <div className="mr-4">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-300" />
              </div>
              <input
                readOnly
                type="text"
                className="flex-grow w-[100%] md:w-full cursor-pointer outline-none font-poppins bg-transparent text-gray-300 text-sm"
                placeholder="Quick Command"
              />
            </div>

            <div className="space-x-1 flex items-center">
              <kbd className="kbd kbd-sm">ctrl</kbd>
              <kbd className="kbd kbd-sm">k</kbd>
            </div>
          </div>
        </div>

        <div className="dropdown dropdown-end">
          <button
            type="button"
            className="avatar w-8 md:w-10 tooltip tooltip-bottom"
            data-tip={user.name}
          >
            <label tabIndex={0} className="mask mask-hexagon cursor-pointer">
              <Image
                src={user.avatar}
                width={50}
                height={50}
                alt={user.name}
                className="aspect-square"
              />
            </label>
          </button>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link passHref href="/settings" className="flex items-center">
                <Cog8ToothIcon aria-hidden="true" className="w-5 h-5" />
                <p>Settings</p>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={logout}
                className="flex items-center"
              >
                <PowerIcon className="w-5 h-5" />
                <p>Logout</p>
              </button>
            </li>
          </ul>
        </div>
        <button className="btn btn-ghost btn-circle" title="Notifications">
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
