
class IconExtensionMem {
    public static icons: Record<string, string> = {
        'png': '/icons/png.png',
        'jpg': '/icons/png.png',
        'JPG': '/icons/png.png',
        'webp': '/icons/png.png',
        'mp4': '/icons/play.png',
        'mov': '/icons/play.png',
        'mkv': '/icons/play.png',
        'h264': '/icons/play.png',
        'avi': '/icons/play.png',
        'mpeg': '/icons/play.png',
        'mpg': '/icons/play.png',
        'm4v': '/icons/play.png',
        'flv': '/icons/play.png',
        'docs': '/icons/docs.png',
        'doc': '/icons/docs.png',
        'docx': '/icons/docs.png',
        'dotm': '/icons/docs.png',
        'docm': '/icons/docs.png',
        'dotx': '/icons/docs.png',
        'pdf': '/icons/pdf.png',
        'xlsx': '/icons/sheets.png',
        'xlsm': '/icons/sheets.png',
        'xlsb': '/icons/sheets.png',
        'xlam': '/icons/sheets.png',
        'zip': '/icons/zip.png',
        'rar': '/icons/zip.png',
    };
}

export default function getIconExtensionUrl(filename: string, mimeType?: string): string {
    let ext = filename.split('.').pop()?.toLowerCase();

    switch (mimeType) {
        case 'application/vnd.google-apps.spreadsheet':
            ext = 'xlsx'
            break;

        case 'application/vnd.google-apps.document':
            ext = 'docx'
            break;

        default:
            break;
    }

    if (!ext) return '/icons/file.png';

    return IconExtensionMem.icons[ext] || '/icons/file.png';

}