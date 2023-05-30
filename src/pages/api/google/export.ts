import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

import userApi from '../../../apis/user.api';
import googledriveApi from '../../../apis/googledrive.api';
import { HttpErrorExeption } from '../../../exeptions/httpErrorExeption';

function isUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { url, mimeType, uid, filename } = req.query;
    if (typeof uid !== "string" || typeof url !== "string" || typeof mimeType !== "string")
        return res.status(400).json({ error: "Missing required query params." });

    if (!isUrl(url)) return res.status(400).json({ error: "Invalid URL." });

    if (!mimeType.startsWith('application/vnd.google-apps')) {
        return res.status(400).json({ error: `Invalid mimeType: ${mimeType}` });
    }

    const urlInURL = new URL(url);
    urlInURL.searchParams.delete('alt');
    const accessToken = urlInURL.searchParams.get('qat');

    if (!accessToken) return res.status(400).json({ error: "Invalid URL. Missing required params!" });

    const pathname = urlInURL.pathname;
    const fileId = pathname.split('/files/')[1];

    if (!fileId) return res.status(400).json({ error: "Invalid URL. Missing fileId from URL." });

    try {

        const exportPathnameUrl = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}/export`);

        const [supportedExportMimeTypes, userSettings] = await Promise.all([
            // Get the mimeType export options
            googledriveApi.getSupportedExportMimeTypes(mimeType, req.cookies.qid),

            // Get user's googledrive settings
            userApi.getSettings(uid, "googledriveSettings", req.cookies.qid)
        ]);

        const endOf = mimeType.split(".").pop()!;
        // @ts-ignore - Ignore it
        const selected = supportedExportMimeTypes.find((mt) => mt.name === userSettings.googledriveSettings[endOf]);
        if (!selected) {
            throw new HttpErrorExeption(400, 'Invalid mime type.');
        }

        exportPathnameUrl.searchParams.append('mimeType', selected.mimeType);

        const resp = await fetch(exportPathnameUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!resp.ok) {
            const { error } = await resp.json();
            return res.status(resp.status).send(error);
        }

        const arrayBuffer = await resp.arrayBuffer();

        res.setHeader('Content-Type', resp.headers.get('content-type')!);
        res.setHeader('Content-Length', arrayBuffer.byteLength);
        if (typeof filename === "string") {
            const name = path.extname(filename) ? filename : `${filename}${selected.extension}`;
            res.setHeader('Content-Disposition', `attachment; filename=${name}`);
        }

        return res.status(200).send(Buffer.from(arrayBuffer));

    } catch (error) {
        if (error instanceof HttpErrorExeption) {
            return res.status(error.status).send({ error: error.message });
        }

        return res.status(500).send({ error: "Internal server error." });
    }

}