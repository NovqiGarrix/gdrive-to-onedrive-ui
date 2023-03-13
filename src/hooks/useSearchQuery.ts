import { useState, useEffect } from 'react';

export default function useSearchQuery() {

    const [searchQuery, setSearchQuery] = useState('');
    const [debounceQuery, setDebounceQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceQuery(searchQuery);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    return { searchQuery, setSearchQuery, debounceQuery };

}