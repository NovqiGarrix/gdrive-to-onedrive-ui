import { NextRouter } from "next/router";

import type { ProviderObject } from "../types";
import useCloudProvider from "../hooks/useCloudProvider";
import useSelectedFiles from "../hooks/useSelectedFiles";
import useProviderPath from "../hooks/useProviderPath";

export default async function onProviderChange(router: NextRouter, provider: ProviderObject) {
    const queryParams = new URLSearchParams(
        router.query as Record<string, string>
    );

    queryParams.delete("path");
    useProviderPath.setState({ path: undefined });

    queryParams.set("provider", provider.id);
    await router.push(`/?${queryParams.toString()}`, undefined, {
        shallow: true,
    });
    useSelectedFiles.setState({ files: [] });
    useCloudProvider.setState({ provider });
}