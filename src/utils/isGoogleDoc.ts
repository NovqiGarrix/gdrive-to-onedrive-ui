

export default function isGoogleDoc(mimeType: string | undefined): boolean {
    return mimeType?.startsWith('application/vnd.google-apps') || false;
}