import { FunctionComponent } from "react";
import LinkedAccounts from "./LinkedAccounts";

const AccountSettings: FunctionComponent = () => {
  return (
    <div className="divide-y divide-gray-200">
      {/* Linked Accounts */}
      <LinkedAccounts />

      {/* Delete Account Section */}
      <div className="pt-4 pb-5 flex items-center justify-between">
        <div className="w-8/12">
          <h3 className="font-bold text-base text-gray-600">Delete account</h3>
          <p className="text-sm text-gray-400">
            This action is can not be undone. You will not lose any of your
            files.
          </p>
        </div>

        <button
          type="button"
          className="flex-shrink-0 text-sm text-gray-500 hover:text-gray-600"
        >
          Delete account
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
