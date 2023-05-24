import { useQuery } from '@tanstack/react-query';

import { GetFilesReturn } from '../types';
import useGetFilesFunc from './useGetFilesFunc';
import { HttpErrorExeption } from '../exeptions/httpErrorExeption';

import useSearchQuery from './useSearchQuery';
import useProviderPath from './useProviderPath';
import useCloudProvider from './useCloudProvider';
import { useMemo } from 'react';

function useGetFolders(enabled: boolean) {
    const path = useProviderPath((s) => s.path);
    const query = useSearchQuery((s) => s.debounceQuery);
    const providerId = useCloudProvider((s) => s.provider.id);

    const queryKey = useMemo(() => ["folders", providerId, path, query], [path, providerId, query]);

    const getFiles = useGetFilesFunc();

    const { isLoading, isError, error, isFetching, data } = useQuery<
        GetFilesReturn,
        HttpErrorExeption
    >({
        queryKey,
        queryFn: () => getFiles({ path, foldersOnly: true, query }),
        retry: false,
        enabled,
        refetchOnMount: true,
        refetchOnWindowFocus: false
    });

    return {
        isLoading,
        isError,
        error,
        isFetching,
        data,
        queryKey
    }
}

export default useGetFolders;