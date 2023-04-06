import { NextApiRequest, NextApiResponse } from 'next';
import { HttpErrorExeption } from '../../../exeptions/httpErrorExeption';

function isUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

function getGoogleExportMimeType(mimeType: string): string {

    switch (mimeType) {
        case 'application/vnd.google-apps.document':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        case 'application/vnd.google-apps.spreadsheet':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        case 'application/vnd.google-apps.presentation':
            return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

        default:
            throw new HttpErrorExeption(400, `Invalid mimeType: ${mimeType}`);
    }

}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const { url, mimeType } = req.query;
    if (typeof url !== "string" || typeof mimeType !== "string") return res.status(400).json({ error: "Missing required query params." });

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
        exportPathnameUrl.searchParams.append('mimeType', getGoogleExportMimeType(mimeType));

        const resp = await fetch(exportPathnameUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const arrayBuffer = await resp.arrayBuffer();
        const contentType = resp.headers.get('content-type')!;

        if (contentType === 'application/json') {
            const { error } = JSON.parse(new TextDecoder().decode(arrayBuffer));
            return res.status(resp.status).send(error);
        }

        if (!resp.ok) return res.status(resp.status).send({ error: resp.statusText });

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', arrayBuffer.byteLength);

        return res.status(200).send(Buffer.from(arrayBuffer));

    } catch (error) {
        if (error instanceof HttpErrorExeption) {
            return res.status(error.status).send({ error: error.message });
        }

        console.log(error, 'in src/pages/api/google/export.ts');
        return res.status(500).send({ error: "Internal server error." });
    }

}