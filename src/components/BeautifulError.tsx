import { FunctionComponent, MouseEvent, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function BeautifulError() {}

interface IRootProps {
  children: ReactNode;
}

const Root: FunctionComponent<IRootProps> = ({ children }) => {
  return (
    <div className="mt-[50px] w-full max-w-3xl p-6 bg-red-100 rounded-[10px]">
      {children}
    </div>
  );
};

interface ITitleProps {
  title: string;
}

const Title: FunctionComponent<ITitleProps> = ({ title }) => {
  return (
    <div className="flex items-center">
      <div className="p-3 bg-red-500 rounded-full">
        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
      </div>
      <h2 className="font-inter font-medium text-lg text-gray-700 ml-4">
        {title}
      </h2>
    </div>
  );
};

interface IMessageProps {
  message: string;
}

const Message: FunctionComponent<IMessageProps> = ({ message }) => {
  return (
    <p className="ml-[4rem] mt-3 font-inter text-base text-gray-700">
      {message}
    </p>
  );
};

interface IButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}

const Button: FunctionComponent<IButtonProps> = ({ children, onClick }) => {
  return (
    <button
      role="link"
      type="button"
      onClick={onClick}
      className="ml-[4rem] mt-5 rounded-[10px] font-medium px-4 py-2.5 text-sm border bg-red-500/90 hover:bg-red-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-100 focus:ring-red-500 font-inter text-white"
    >
      {children}
    </button>
  );
};

BeautifulError.Root = Root;
BeautifulError.Title = Title;
BeautifulError.Message = Message;
BeautifulError.Button = Button;

export default BeautifulError;
