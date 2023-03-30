import { useQuery } from "@tanstack/react-query";

import authApi from "../apis/auth.api";
import type { AccountObject } from "../types";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";


export default function useGetLinkedAccounts() {
    return useQuery<Array<AccountObject>, HttpErrorExeption>({
        queryKey: ["linkedAccounts"],
        queryFn: authApi.getLinkedAccounts,

        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
    });
}