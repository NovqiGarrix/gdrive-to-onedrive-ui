import { FormEvent, Fragment, memo, useRef, useState } from "react";

import { toast } from "react-hot-toast";
import { shallow } from "zustand/shallow";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FolderPlusIcon from "@heroicons/react/24/outline/FolderPlusIcon";

import type { ProviderObject } from "../types";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

import onedriveApi from "../apis/onedrive.api";
import googledriveApi from "../apis/googledrive.api";

import useGetFolders from "../hooks/useGetFolders";
import useProviderPath from "../hooks/useProviderPath";
import useCloudProvider from "../hooks/useCloudProvider";
import useNewFolderModal from "../hooks/useNewFolderModal";

import LoadingIcon from "./LoadingIcon";

function createFolderFunc(provider: ProviderObject, foldername: string, path?: string) {

    switch (provider.id) {
        case 'google_drive':
            return googledriveApi.createFolder(foldername, path);

        case 'onedrive':
            return onedriveApi.createFolder(foldername, path);

        default:
            throw new Error(`${provider.name} does no support folders`);
    }

}

const NewFolderModal = memo(function WarningModal() {

    const queryClient = useQueryClient();

    const [error, setError] = useState('');
    const { open, setOpen, provider: _provider, queryKey: _queryKey } = useNewFolderModal((s) => s, shallow);

    const formRef = useRef<HTMLFormElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    const path = useProviderPath((s) => s.path);
    const provider = useCloudProvider((s) => _provider || s.provider, shallow);

    const { queryKey } = useGetFolders(false);

    function afterLeave() {
        setError('');
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);
        const foldername = formData.get('foldername');

        if (!foldername) {
            setError('A folder name must be provided.');
            return;
        }

        await createFolderFunc(provider, foldername.toString(), path);
        await queryClient.prefetchQuery(_queryKey || queryKey);
    }

    const { mutateAsync: onSubmit, isLoading } = useMutation<void, HttpErrorExeption, FormEvent<HTMLFormElement>>({
        mutationFn: submit,
        mutationKey: ['new-folder'],
        onError(error) {
            setError(error.message);
        },
        onSuccess() {
            setOpen(false);
        },
    });

    return (
        <Transition.Root show={open} as={Fragment} afterLeave={afterLeave}>
            <Dialog
                as="div"
                className="relative z-10"
                initialFocus={cancelButtonRef}
                onClose={setOpen}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <FolderPlusIcon
                                                className="h-6 w-6 text-slate-700"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div className="text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <div className="mt-2">
                                                <form ref={formRef} id="new-folder-form" onSubmit={(e) => {
                                                    toast.promise(onSubmit(e), {
                                                        error,
                                                        success: 'Folder created',
                                                        loading: 'Creating a new folder',
                                                    })
                                                }} className="w-full">
                                                    <label htmlFor="foldername" className="block text-base leading-6 text-gray-900">
                                                        Folder name
                                                    </label>
                                                    <span className="block mt-1 text-xs leading-6 text-red-500">
                                                        {error}
                                                    </span>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            id="foldername"
                                                            name="foldername"
                                                            className="block w-full rounded-md border-0 py-2 text-gray-900 form-input shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-700 sm:text-sm sm:leading-6"
                                                        />
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        form="new-folder-form"
                                        className="inline-flex w-full justify-center rounded-md bg-slate-700 text-slate-50 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-800 sm:ml-3 sm:w-auto focus:outline-none disabled:cursor-not-allowed disabled:opacity-90"
                                    >
                                        {isLoading ? (
                                            <LoadingIcon className="w-5 h-5" fill="rgb(248 250 252 / 1)" />
                                        ) : (
                                            <span>Submit</span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        ref={cancelButtonRef}
                                        onClick={() => setOpen(false)}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
});

export default NewFolderModal;