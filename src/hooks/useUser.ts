import { create } from 'zustand';
import { User } from '../types';

interface UseUser {
    user: User;
    setUser: (user: Partial<User>) => void;
}

const useUser = create<UseUser>((set) => ({
    user: {
        id: '',
        name: '',
        email: '',
        avatar: '',
        realmQid: '',
        defaultProviderId: 'google_drive'
    },

    setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
}));

export default useUser;

let isInitialized = false;

export function initUserStore(user: User) {

    if (!user) return;
    useUser.setState({ user });

    isInitialized = true;

}