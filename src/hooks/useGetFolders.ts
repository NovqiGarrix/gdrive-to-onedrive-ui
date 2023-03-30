import { useQuery } from '@tanstack/react-query';

import { GetFilesReturn } from '../types';
import useGetFilesFunc from '../components/useGetFilesFunc';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import useSearchQuery from './useSearchQuery';
import useProviderPath from './useProviderPath';
import useCloudProvider from './useCloudProvider';

function useGetFolders(enabled: boolean) {
    const path = useProviderPath((s) => s.path);
    const query = useSearchQuery((s) => s.debounceQuery);
    const providerId = useCloudProvider((s) => s.provider.id);

    const getFiles = useGetFilesFunc();

    return useQuery<
        GetFilesReturn,
        HttpErrorExeption
    >({
        queryFn: () => getFiles({ path, foldersOnly: true, query }),
        queryKey: ["folders", providerId, path, query],
        retry: false,
        enabled,
        refetchOnMount: true,
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
    });
}

export default useGetFolders;