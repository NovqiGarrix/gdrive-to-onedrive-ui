import { FunctionComponent, useCallback } from "react";

import PowerIcon from "@heroicons/react/24/outline/PowerIcon";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Provider } from "../types";
import authApi from "../apis/auth.api";
import classNames from "../utils/classNames";
import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

import LoadingIcon from "./LoadingIcon";

interface IProviderLogoutProps {
  providerId: Provider;
  debounceQuery: string;
  path: string | undefined;
}

const ProviderLogout: FunctionComponent<IProviderLogoutProps> = (props) => {
  const { providerId, debounceQuery: searchQuery, path } = props;

  const logoutFunc = useCallback(() => {
    switch (providerId) {
      case "onedrive":
        return authApi.logoutFromMicrosoft();

      default:
        throw new Error("Invalid Provider!");
    }
  }, [providerId]);

  const queryClient = useQueryClient();

  const { isLoading: isLoggingOut, mutate: logoutMutation } = useMutation({
    mutationFn: logoutFunc,
    async onSuccess() {
      await queryClient.invalidateQueries(
        [
          "files",
          providerId,
          searchQuery,
          path,
          providerId === "google_photos"
            ? JSON.stringify(useGooglePhotosFilter.getState().formattedFilters)
            : undefined,
        ].filter(Boolean)
      );
    },
  });

  return (
    <div
      className="tooltip tooltip-bottom"
      data-tip={isLoggingOut ? "Logging Out..." : "Logout"}
    >
      <button
        type="button"
        title={isLoggingOut ? "Logging Out..." : "Logout"}
        disabled={isLoggingOut}
        onClick={() => logoutMutation()}
        className={classNames(
          "btn group btn-sm btn-circle",
          isLoggingOut ? "btn-active" : "btn-ghost"
        )}
      >
        {isLoggingOut ? (
          <LoadingIcon className="w-5 h-5 group-hover:text-white text-darken" />
        ) : (
          <PowerIcon className="w-5 h-5 group-hover:text-white text-darken" />
        )}
      </button>
    </div>
  );
};

export default ProviderLogout;
