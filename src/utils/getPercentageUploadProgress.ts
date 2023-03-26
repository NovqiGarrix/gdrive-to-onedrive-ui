export default function getPercentageUploadProgress(loaded: number, total: number): number {
    return Math.round((loaded * 100) / total!);
}