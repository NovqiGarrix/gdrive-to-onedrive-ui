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

  return <div></div>;
};

export default Navbar;
