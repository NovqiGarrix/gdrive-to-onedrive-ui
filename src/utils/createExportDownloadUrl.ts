import useUser from "../hooks/useUser";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";


export default function createExportDownloadUrl(mimeType: string, downloadUrl: string, filename?: string) {
    const downloadUrlInURL = new URL(downloadUrl);
    const googleDownloadUrl = downloadUrlInURL.searchParams.get('url');
    if (!googleDownloadUrl) throw new HttpErrorExeption(400, 'Invalid downloadUrl for GDrive.');

    let downloadUlrInString = downloadUrlInURL.toString();

    /**
     * If the file is a Google Doc, Sheets, or Slides file,
     * we need to export them to a different format
     * in order to download them.
     */
    if (mimeType?.startsWith('application/vnd.google-apps')) {
        const uid = useUser.getState().user.id;
        if (!uid) {
            throw new HttpErrorExeption(400, 'You need to login first.');
        }

        downloadUlrInString = `/api/google/export?url=${encodeURIComponent(googleDownloadUrl)}&mimeType=${encodeURIComponent(mimeType)}&uid=${uid}&filename=${filename}`;
    }

    return downloadUlrInString;
}