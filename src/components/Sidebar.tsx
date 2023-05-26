import { FunctionComponent } from "react";
import Image from "next/image";

import SidebarMenu from "./SidebarMenu";
import SelectProvider from "./SelectProvider";
import Link from "next/link";

const Sidebar: FunctionComponent = () => {
  return (
    <section className="w-[294px] flex-shrink-0 min-h-screen h-full border-r border-[#E2E3E5] py-[45px]">
      {/* Company Logo and Name */}
      <Link href="/" passHref>
        <div className="w-60 pl-[30px]">
          <Image
            priority
            width={1080}
            height={720}
            src="/logo.webp"
            className="object-cover"
            alt="cloudtransfer.io Logo"
          />
        </div>
      </Link>

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

        <SidebarMenu />
      </div>
    </section>
  );
};

export default Sidebar;
