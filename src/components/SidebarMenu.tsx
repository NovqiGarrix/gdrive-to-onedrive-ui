import {
  Dispatch,
  FunctionComponent,
  MouseEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import SolidFolder from "@heroicons/react/24/solid/FolderIcon";
import OutlineFolder from "@heroicons/react/24/outline/FolderIcon";

import SolidCog from "@heroicons/react/24/solid/Cog6ToothIcon";
import OutlineCog from "@heroicons/react/24/outline/Cog6ToothIcon";

import classNames from "../utils/classNames";
import useShowSettingsModal from "../hooks/useShowSettingsModal";

const SidebarMenu: FunctionComponent = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const generalMenus: Array<GeneralMenu> = useMemo(() => {
    return [
      {
        type: "button",
        label: "My Files",
        ActiveIcon: SolidFolder,
        InActiveIcon: OutlineFolder,
        onClick: () => {},
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

  const showSettingsModal = useShowSettingsModal((state) => state.open);

  useEffect(() => {
    // If user closes the settings modal, set the active index
    // back to 0 (My Files)
    if (!showSettingsModal) {
      setActiveIndex(0);
    }
  }, [showSettingsModal]);

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

interface GeneralMenu {
  onClick: (
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  label: string;
  ActiveIcon: typeof SolidFolder;
  InActiveIcon: typeof SolidFolder;
}

type IEachMenuListProps = {
  index: number;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
} & GeneralMenu;

const EachMenuList: FunctionComponent<IEachMenuListProps> = (props) => {
  const {
    ActiveIcon,
    InActiveIcon,
    label,
    index,
    activeIndex,
    setActiveIndex,
    onClick,
  } = props;

  const [isHovering, setIsHovering] = useState(false);
  const isActive = activeIndex === index || isHovering;

  return (
    <li
      key={label}
      onMouseOver={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          setActiveIndex(index);
          onClick(e);
        }}
        className={classNames(
          "p-[15px] w-full flex items-center space-x-[15px] rounded-[10px] group",
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
      </button>
    </li>
  );
};
