const GOOGLE_DOC_MIMETYPES = ['application/vnd.google-apps.spreadsheet', 'application/vnd.google-apps.document', 'application/vnd.google-apps.presentation'];

export default function isGoogleDocsFile(mimeType: string) {
    return GOOGLE_DOC_MIMETYPES.includes(mimeType);
}