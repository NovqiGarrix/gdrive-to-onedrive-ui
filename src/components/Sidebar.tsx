import { FunctionComponent, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import SolidFolder from "@heroicons/react/24/solid/FolderIcon";
import OutlineFolder from "@heroicons/react/24/outline/FolderIcon";

// import SolidStar from "@heroicons/react/24/solid/StarIcon";
// import OutlineStar from "@heroicons/react/24/outline/StarIcon";

import SolidCog from "@heroicons/react/24/solid/Cog6ToothIcon";
import OutlineCog from "@heroicons/react/24/outline/Cog6ToothIcon";

import classNames from "../utils/classNames";
import SelectProvider from "./SelectProvider";

interface ISidebarProps {}

const generalMenus = [
  {
    label: "My Files",
    href: "/",
    ActiveIcon: SolidFolder,
    InActiveIcon: OutlineFolder,
  },
  // {
  //   label: "Favorites",
  //   href: "/favs",
  //   ActiveIcon: SolidStar,
  //   InActiveIcon: OutlineStar,
  // },
  {
    label: "Settings",
    href: "/settings",
    ActiveIcon: SolidCog,
    InActiveIcon: OutlineCog,
  },
];

const EachMenuList: FunctionComponent<typeof generalMenus[number]> = (
  props
) => {
  const { ActiveIcon, InActiveIcon, href, label } = props;

  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  const isActive = href === router.pathname || isHovering;

  return (
    <li
      key={label}
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link
        passHref
        href={href}
        className={classNames(
          "p-[15px] flex items-center space-x-[15px] rounded-[5px] group",
          isActive ? "bg-white shadow-2xl" : "shadow-none"
        )}
      >
        <div className="w-5 h-5 relative">
          <InActiveIcon
            className={classNames(
              "w-5 h-5 absolute text-fontBlack transition-all",
              isActive ? "opacity-0" : "opacity-100"
            )}
          />
          <ActiveIcon
            className={classNames(
              "w-5 h-5 absolute text-fontBlack duration-150 transition-all",
              isActive ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
        <span
          className={classNames(
            "text-sm text-gray-600/90 group-hover:text-fontBlack group-hover:font-medium",
            isActive ? "font-medium" : "font-normal"
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
};

const Sidebar: FunctionComponent<ISidebarProps> = (props) => {
  return (
    <section className="w-[294px] flex-shrink-0 min-h-screen h-full border-r border-[#E2E3E5] py-[40px]">
      {/* Company Logo and Name */}
      <div className="px-[34px] flex items-center">
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
          <Image
            src="/logo.png"
            alt="infile.io Logo"
            width={500}
            height={500}
            className="rounded-full"
          />
        </div>

        <h2 className="font-medium text-xl ml-[14px]">infile.io</h2>
      </div>

      {/* ========== Sidebar Menus ========= */}

      {/* Providers */}
      <div className="mt-[46px] mb-[42px]">
        <h3 className="text-base font-medium px-[34px] text-fontGray">
          Providers
        </h3>

        <SelectProvider />
      </div>

      <div className="border border-b border-[#E2E3E5]"></div>

      {/* General Menu */}
      <div className="mt-[30px] mb-[40px]">
        <h3 className="text-base font-medium px-[34px] text-fontGray">
          General Menu
        </h3>

        <ul className="mt-[30px] pl-[24px] pr-[34px] space-y-[6px]">
          {generalMenus.map((menu) => (
            <EachMenuList key={menu.label} {...menu} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Sidebar;
