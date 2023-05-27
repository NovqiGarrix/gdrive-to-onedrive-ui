import { FunctionComponent, useMemo, useState } from "react";

import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { useMutation } from "@tanstack/react-query";

import classNames from "../utils/classNames";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import useGetUserSettings from "../hooks/useGetUserSettings";
import useShowSettingsModal from "../hooks/useShowSettingsModal";

import userApi from "../apis/user.api";
import { GetSupportedExportMimeTypesReturn } from "../apis/googledrive.api";

import LoadingIcon from "./LoadingIcon";
import SelectExportMimeType from "./SelectExportMimeType";

const defaultValue: GetSupportedExportMimeTypesReturn = {
    name: '',
    mimeType: ''
}

const GoogleDriveSettings: FunctionComponent = () => {

    const [googleDoc, setGoogleDoc] = useState<GetSupportedExportMimeTypesReturn>(defaultValue);
    const [googleSheet, setGoogleSheet] = useState<GetSupportedExportMimeTypesReturn>(defaultValue);
    const [googleSlide, setGoogleSlide] = useState<GetSupportedExportMimeTypesReturn>(defaultValue);
    const [googleDrawing, setGoogleDrawing] = useState<GetSupportedExportMimeTypesReturn>(defaultValue);
    const [googleScript, setGoogleScript] = useState<GetSupportedExportMimeTypesReturn>(defaultValue);

    const { data: userSettings } = useGetUserSettings();

    const canSave = useMemo(() => {
        return !shallow({
            drawing: userSettings?.googledriveSettings.drawing,
            script: userSettings?.googledriveSettings.script,
            spreadsheet: userSettings?.googledriveSettings.spreadsheet,
            presentation: userSettings?.googledriveSettings.presentation,
            document: userSettings?.googledriveSettings.document,
        }, {
            drawing: googleDrawing.name,
            script: googleScript.name,
            spreadsheet: googleSheet.name,
            presentation: googleSlide.name,
            document: googleDoc.name,
        })
    }, [
        googleDoc.name,
        googleDrawing.name,
        googleScript.name,
        googleSheet.name,
        googleSlide.name,
        userSettings?.googledriveSettings.script,
        userSettings?.googledriveSettings.drawing,
        userSettings?.googledriveSettings.document,
        userSettings?.googledriveSettings.spreadsheet,
        userSettings?.googledriveSettings.presentation
    ]);

    const { mutate, isLoading: isUpdatingSettings } = useMutation({
        mutationKey: ['update_googledrive_settings'],
        mutationFn: () => userApi.updateGdriveSettings({
            document: googleDoc.name,
            spreadsheet: googleSheet.name,
            presentation: googleSlide.name,
            drawing: googleDrawing.name,
            script: googleScript.name
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

    function onCancel() {
        useShowSettingsModal.setState({ open: false });
    }

    return (
        <div className="divide-y divide-gray-200 pt-4">

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <SelectExportMimeType
                            label="Export Google Docs to"
                            mimeType="application/vnd.google-apps.document"
                            selected={googleDoc}
                            setSelected={setGoogleDoc}
                            userGoogleDriveSettings={userSettings?.googledriveSettings!}
                        />
                    </div>

                    <div>
                        <SelectExportMimeType
                            label="Export Google Sheets to"
                            mimeType="application/vnd.google-apps.spreadsheet"
                            selected={googleSheet}
                            setSelected={setGoogleSheet}
                            userGoogleDriveSettings={userSettings?.googledriveSettings!}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <SelectExportMimeType
                            label="Export Google Slides to"
                            mimeType="application/vnd.google-apps.presentation"
                            selected={googleSlide}
                            setSelected={setGoogleSlide}
                            userGoogleDriveSettings={userSettings?.googledriveSettings!}
                        />
                    </div>

                    <div>
                        <SelectExportMimeType
                            label="Export Google Drawing to"
                            mimeType="application/vnd.google-apps.drawing"
                            selected={googleDrawing}
                            setSelected={setGoogleDrawing}
                            userGoogleDriveSettings={userSettings?.googledriveSettings!}
                        />
                    </div>
                </div>

                <div className="pb-5">
                    <SelectExportMimeType
                        label="Export Google Scripts to"
                        mimeType="application/vnd.google-apps.script"
                        selected={googleScript}
                        setSelected={setGoogleScript}
                        userGoogleDriveSettings={userSettings?.googledriveSettings!}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-3 space-x-4">
                <button disabled={isUpdatingSettings} onClick={onCancel} type="button" className="py-2 px-4 text-sm bg-slate-200 text-slate-600 font-medium hover:text-slate-700 hover:bg-slate-300 rounded-md disabled:opacity-70 disabled:cursor-not-allowed">
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={isUpdatingSettings || !canSave}
                    onClick={() => mutate()}
                    className={classNames("py-2 px-4 text-sm bg-slate-700 text-slate-100 font-medium hover:bg-slate-900 hover:text-slate-50 rounded-md disabled:cursor-not-allowed",
                        canSave ? "opacity-100" : "opacity-70"
                    )}
                >
                    {isUpdatingSettings ? (
                        <LoadingIcon className="w-5 h-5" fill="rgb(241 245 249 / 1)" />
                    ) : (
                        <span>Save</span>
                    )}
                </button>
            </div>
        </div>
    )

}

export default GoogleDriveSettings;