import isGoogleDoc from "./isGoogleDoc";

function getGoogleDocExtension(mimeType: string | undefined): string {
    switch (mimeType) {
        case 'application/vnd.google-apps.document':
            return `docx`;

        case 'application/vnd.google-apps.spreadsheet':
            return `xlsx`;

        case 'application/vnd.google-apps.presentation':
            return `pptx`;

        default:
            throw new Error(`Invalid mimeType: ${mimeType}`);
    }
}

export default function getFilename(filename: string, mimeType: string | undefined): string {

    if (isGoogleDoc(mimeType)) {
        const extension = getGoogleDocExtension(mimeType);
        filename = `${filename}.${extension}`;
    }

    return filename;

}