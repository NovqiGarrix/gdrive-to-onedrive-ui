import { create } from "zustand";
import { ProviderObject } from "../types";

interface IUseTransferFilesModal {
    providerTarget: ProviderObject | undefined;
}

const useTransferFilesModal = create<IUseTransferFilesModal>(() => ({
    providerTarget: undefined,
}));

export default useTransferFilesModal;