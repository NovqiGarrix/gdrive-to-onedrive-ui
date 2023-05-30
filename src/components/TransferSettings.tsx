import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { toast } from "react-hot-toast";
import { Switch } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import userApi from "../apis/user.api";
import classNames from "../utils/classNames";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useGetUserSettings from "../hooks/useGetUserSettings";
import useShowSettingsModal from "../hooks/useShowSettingsModal";

import LoadingIcon from "./LoadingIcon";

const TransferSettings: FunctionComponent = () => {

    const queryClient = useQueryClient();
    const { data: userSettings, queryKey } = useGetUserSettings();

    const [isMove, setIsMove] = useState(false);

    useEffect(() => {
        if (!userSettings?.transferSettings) return;
        setIsMove(userSettings.transferSettings.moveFile);

    }, [userSettings?.transferSettings]);

    function onMoveSwitchChange() {
        setIsMove((prev) => !prev);
    }

    function onCancel() {
        useShowSettingsModal.setState({ open: false });
    }

    const canSave = useMemo(() => isMove !== userSettings?.transferSettings.moveFile, [isMove, userSettings?.transferSettings.moveFile]);

    const { mutate, isLoading: isUpdatingSettings } = useMutation({
        mutationKey: ['update_transfer_settings'],
        mutationFn: () => userApi.updateTransferSettings({ moveFile: isMove }),

        async onSuccess() {
            toast.success('Settings updated.');
            await queryClient.prefetchQuery(queryKey);
        },

        onError(error) {
            if (error instanceof HttpErrorExeption) {
                try {
                    const errors = JSON.parse(error.message);

                    for (const { field, message } of errors) {
                        toast.error(`Field '${field}': ${message}`);
                    }

                } catch (_err) {
                    // Are not `errors`, because JSON could not parse it
                    toast.error(error.message);
                }
            }
        }
    });

    return (
        <div className="divide-y divide-gray-200">
            <div className="pt-4 pb-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-700">Move files</h3>
                        <p className="text-sm text-slate-500 ">
                            Instead of making copy of your files, we will move them
                        </p>
                    </div>

                    <div className="flex items-center space-x-5">
                        <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
                            <div className="flex h-8 items-center">
                                <Switch
                                    checked={isMove}
                                    onChange={onMoveSwitchChange}
                                    className={classNames(
                                        isMove ? 'bg-indigo-600' : 'bg-gray-200',
                                        'flex w-10 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    )}
                                >
                                    <span className="sr-only">Agree to policies</span>
                                    <span
                                        aria-hidden="true"
                                        className={classNames(
                                            isMove ? 'translate-x-[18px]' : 'translate-x-0',
                                            'h-5 w-5 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'
                                        )}
                                    />
                                </Switch>
                            </div>
                        </Switch.Group>
                    </div>
                </div>

                <div className="flex justify-end mt-3 space-x-4">
                    <button onClick={onCancel} disabled={isUpdatingSettings} type="button" className="py-2 px-4 text-sm bg-slate-200 text-slate-600 font-medium hover:text-slate-700 hover:bg-slate-300 rounded-md disabled:opacity-70 disabled:cursor-not-allowed">
                        Cancel
                    </button>
                    <button type="button" disabled={isUpdatingSettings || !canSave} onClick={() => mutate()} className={classNames("py-2 px-4 text-sm bg-slate-700 text-slate-100 font-medium hover:bg-slate-900 hover:text-slate-50 rounded-md disabled:cursor-not-allowed", canSave ? "opacity-100" : "opacity-70")}>
                        {isUpdatingSettings ? (
                            <LoadingIcon className="w-5 h-5" fill="rgb(241 245 249 / 1)" />
                        ) : (
                            <span>Save</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )

}

export default TransferSettings;