import { ChangeEvent, FunctionComponent, useEffect, useMemo, useState } from "react";

import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { Switch } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";

import userApi from "../apis/user.api";
import classNames from "../utils/classNames";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useGetUserSettings from "../hooks/useGetUserSettings";
import useShowSettingsModal from "../hooks/useShowSettingsModal";

import LoadingIcon from "./LoadingIcon";

const TransferSettings: FunctionComponent = () => {

    const { data: userSettings } = useGetUserSettings();

    const [options, setOptions] = useState({
        move: false,
        enableDelay: true,
        delay: '5',
        delayKind: 's'
    });

    const [isMoreSettingOpen, setIsMoreSettingOpen] = useState(false);

    useEffect(() => {
        if (!userSettings?.transferSettings) return;

        const tfSettings = userSettings.transferSettings;

        setOptions({
            move: tfSettings.moveFile,
            enableDelay: tfSettings.enableMoveDelay,
            delay: tfSettings.moveDelay.toString(),
            delayKind: tfSettings.moveDelayKind
        });

    }, [userSettings?.transferSettings]);

    function onMoveSwitchChange(move: boolean) {
        setOptions((prev) => ({ ...prev, move }));
    }

    function onMoreSettingClick() {
        setIsMoreSettingOpen((prev) => !prev);
    }

    function onDeleteAfterInputChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.valueAsNumber > 3600) return;

        setOptions((prev) => ({ ...prev, delay: event.target.value }));
    }

    function onDelayKindChange(event: ChangeEvent<HTMLSelectElement>) {
        setOptions((prev) => ({ ...prev, delayKind: event.target.value }));
    }

    function onEnableDelayChange(enable: boolean) {
        setOptions((prev) => ({ ...prev, enableDelay: enable }));
    }

    function onCancel() {
        useShowSettingsModal.setState({ open: false });
    }

    const disabledMoreSetting = !options.move || !options.enableDelay;

    const canSave = useMemo(() => {
        return !shallow({
            move: userSettings?.transferSettings.moveFile,
            enableDelay: userSettings?.transferSettings.enableMoveDelay,
            delay: userSettings?.transferSettings.moveDelay.toString(),
            delayKind: userSettings?.transferSettings.moveDelayKind
        }, options);
    }, [
        options,
        userSettings?.transferSettings.moveFile,
        userSettings?.transferSettings.moveDelay,
        userSettings?.transferSettings.moveDelayKind,
        userSettings?.transferSettings.enableMoveDelay
    ]);

    const { mutate, isLoading: isUpdatingSettings } = useMutation({
        mutationKey: ['update_transfer_settings'],
        mutationFn: () => userApi.updateTransferSettings({
            moveFile: options.move,
            ...(options.enableDelay ?
                // If it enable, then include the others properties
                { enableMoveDelay: options.enableDelay, moveDelay: +options.delay, moveDelayKind: options.delayKind } :
                // otherwise, use previous value
                { enableMoveDelay: options.enableDelay })
        }),

        onSuccess() {
            toast.success('Settings updated.');
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
                        <button onClick={onMoreSettingClick} type="button" className="text-sm text-blue-500 hover:text-blue-600">
                            {isMoreSettingOpen ? 'Less Settings' : 'More Settings'}
                        </button>
                        <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
                            <div className="flex h-8 items-center">
                                <Switch
                                    checked={options.move}
                                    onChange={onMoveSwitchChange}
                                    className={classNames(
                                        options.move ? 'bg-indigo-600' : 'bg-gray-200',
                                        'flex w-10 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    )}
                                >
                                    <span className="sr-only">Agree to policies</span>
                                    <span
                                        aria-hidden="true"
                                        className={classNames(
                                            options.move ? 'translate-x-[18px]' : 'translate-x-0',
                                            'h-5 w-5 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'
                                        )}
                                    />
                                </Switch>
                            </div>
                        </Switch.Group>
                    </div>
                </div>

                {isMoreSettingOpen ? (
                    <div className="mt-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="max-w-xs">
                                    <label htmlFor="delete-after" className="block text-xs font-medium leading-6 text-gray-900">
                                        Delete after:
                                    </label>
                                    <div className={classNames("relative mt-1 rounded-md", disabledMoreSetting ? "bg-gray-200" : "")}>
                                        <input
                                            type="text"
                                            name="delete-after"
                                            id="delete-after"
                                            disabled={disabledMoreSetting}
                                            value={options.delay}
                                            onChange={onDeleteAfterInputChange}
                                            className="block w-full disabled:cursor-not-allowed disabled:opacity-75 form-input rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs sm:leading-6"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center">
                                            <select
                                                name="currency"
                                                disabled={disabledMoreSetting}
                                                onChange={onDelayKindChange}
                                                defaultValue={options.delayKind}
                                                className="h-full form-select disabled:cursor-not-allowed rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                                            >
                                                <option value="h">Hours</option>
                                                <option value="m">Minutes</option>
                                                <option value="s">Seconds</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs mt-2 text-slate-500">PS. If you disable it, your files immediately deleted after the transfer is finished</p>
                            </div>
                            <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
                                <div className="flex h-8 items-center">
                                    <Switch
                                        disabled={!options.move}
                                        checked={options.enableDelay}
                                        onChange={onEnableDelayChange}
                                        className={classNames(
                                            options.enableDelay ? !disabledMoreSetting ? 'bg-indigo-600' : 'bg-gray-200' : 'bg-gray-200',
                                            'flex w-10 flex-none cursor-pointer rounded-full p-px ring-1 disabled:cursor-not-allowed ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                        )}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={classNames(
                                                options.enableDelay ? 'translate-x-[18px]' : 'translate-x-0',
                                                'h-5 w-5 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'
                                            )}
                                        />
                                    </Switch>
                                </div>
                            </Switch.Group>
                        </div>
                    </div>
                ) : null}

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