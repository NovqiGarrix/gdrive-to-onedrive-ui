import {
  Dispatch,
  Fragment,
  FunctionComponent,
  MouseEvent,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from "react";

import SolidFolder from "@heroicons/react/24/solid/FolderIcon";
import OutlineFolder from "@heroicons/react/24/outline/FolderIcon";

// import SolidStar from "@heroicons/react/24/solid/StarIcon";
// import OutlineStar from "@heroicons/react/24/outline/StarIcon";

import SolidCog from "@heroicons/react/24/solid/Cog6ToothIcon";
import OutlineCog from "@heroicons/react/24/outline/Cog6ToothIcon";
import useShowSettingsModal from "../hooks/useShowSettingsModal";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "../utils/classNames";

const SidebarMenu: FunctionComponent = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const generalMenus: Array<GeneralMenu> = useMemo(() => {
    return [
      {
        type: "link",
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
        type: "button",
        label: "Settings",
        ActiveIcon: SolidCog,
        InActiveIcon: OutlineCog,
        onClick: () => {
          useShowSettingsModal.setState({
            open: !useShowSettingsModal.getState().open,
          });
        },
      },
    ];
  }, []);

  return (
    <ul className="mt-[30px] pl-[24px] pr-[34px] space-y-[6px]">
      {generalMenus.map((menu, index) => (
        <EachMenuList
          key={menu.label}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          index={index}
          {...menu}
        />
      ))}
    </ul>
  );
};

export default SidebarMenu;

type GeneralMenu =
  | {
      type: "link";

      href: "/";
      label: "My Files";
      ActiveIcon: typeof SolidFolder;
      InActiveIcon: typeof SolidFolder;
    }
  | {
      type: "button";

      onClick: (
        event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
      ) => void;
      label: "Settings";
      ActiveIcon: typeof SolidFolder;
      InActiveIcon: typeof SolidFolder;
    };

type IWrapperEachMenuListProps =
  | {
      type: "link";
      href: string;
      index: number;
      isActive: boolean;
      children: ReactNode;
      setActiveIndex: Dispatch<SetStateAction<number>>;
    }
  | {
      type: "button";
      index: number;
      isActive: boolean;
      children: ReactNode;
      setActiveIndex: Dispatch<SetStateAction<number>>;
      onClick: (
        event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
      ) => void;
    };

const WrapperEachMenuList: FunctionComponent<IWrapperEachMenuListProps> = (
  props
) => {
  const { type, isActive, children, setActiveIndex, index } = props;

  const classes = useMemo(
    () =>
      classNames(
        "p-[15px] w-full flex items-center space-x-[15px] rounded-[10px] group",
        isActive ? "bg-white shadow-2xl" : "shadow-none"
      ),
    [isActive]
  );

  return (
    <Fragment>
      {type === "button" ? (
        <button
          type="button"
          onClick={(e) => {
            setActiveIndex(index);
            props.onClick(e);
          }}
          className={classes}
        >
          {children}
        </button>
      ) : (
        <Link
          passHref
          href={props.href}
          onClick={() => {
            setActiveIndex(index);
          }}
          className={classes}
        >
          {children}
        </Link>
      )}
    </Fragment>
  );
};

type IEachMenuListProps = {
  index: number;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
} & GeneralMenu;

const EachMenuList: FunctionComponent<IEachMenuListProps> = (props) => {
  const { ActiveIcon, InActiveIcon, label, index, activeIndex } = props;

  const [isHovering, setIsHovering] = useState(false);
  const isActive = activeIndex === index || isHovering;

  return (
    <li
      key={label}
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <WrapperEachMenuList {...props} isActive={isActive}>
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
      </WrapperEachMenuList>
    </li>
  );
};
