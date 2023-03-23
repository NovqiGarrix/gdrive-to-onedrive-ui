import {
    useEffect,
    // @ts-ignore - No types
    experimental_useEffectEvent as useEffectEvent,
} from "react";

function useBeforeUnload(handler: (event: BeforeUnloadEvent) => void) {

    const h = useEffectEvent(handler);

    useEffect(() => {
        window.addEventListener("beforeunload", h);
        return () => {
            window.removeEventListener("beforeunload", h);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

export default useBeforeUnload;