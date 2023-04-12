import { Fragment, FunctionComponent, useEffect, useState } from "react";

import { Transition } from "@headlessui/react";
import ArrowUpIcon from "@heroicons/react/24/outline/ArrowUpIcon";

const ScrollToTop: FunctionComponent = () => {
  const [show, setShow] = useState(false);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Transition.Root show={show} as={Fragment}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-30 translate-y-16"
        enterTo="opacity-100 translate-y-0"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-16"
      >
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-10 right-10 p-3 rounded-full bg-white shadow"
        >
          <ArrowUpIcon aria-hidden="true" className="w-5 h-5 text-gray-600" />
        </button>
      </Transition.Child>
    </Transition.Root>
  );
};

export default ScrollToTop;
