import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import useUser from './useUser';
import userApi from '../apis/user.api';
import { UserSettings } from '../types';

export default function useGetUserSettings() {

    const userId = useUser((s) => s.user.id);

    const queryKey = useMemo(() => ['user_settings'], []);

    const { data, isLoading, isError, error } = useQuery<UserSettings, Error>({
        queryKey,
        queryFn: () => userApi.getSettings(userId),

        refetchInterval: Infinity,
        refetchOnWindowFocus: false,

        enabled: Boolean(userId)
    });

    return {
        data,
        isLoading,
        isError,
        error,
        queryKey
    }

}