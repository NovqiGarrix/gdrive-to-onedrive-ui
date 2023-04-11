
export default function getParentIdFromPath(path: string | undefined): string | undefined {
    return path?.split("/").pop()?.split("~")[1];
}