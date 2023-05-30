

export default function cleanPathFromFolderId(path: string | undefined): string | undefined {
    const cleanPath = path?.split("/").map((p) => p.split("~")[0]).join("/");
    return cleanPath?.slice(1, cleanPath.length);
}