

export default function cleanPathFromFolderId(path: string | undefined): string | undefined {
    return path?.split("/").map((p) => p.split("~")[0]).join("/");
}