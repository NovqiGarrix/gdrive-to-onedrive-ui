import { FunctionComponent } from "react";
import Image from "next/image";

import SidebarMenu from "./SidebarMenu";
import SelectProvider from "./SelectProvider";

const Sidebar: FunctionComponent = () => {
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

        <SidebarMenu />
      </div>
    </section>
  );
};

export default Sidebar;
