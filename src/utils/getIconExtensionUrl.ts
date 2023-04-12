
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
        'mp3': '/icons/mp3.png',
        'wav': '/icons/audio.png',
        'aiff': '/icons/audio.png',
        'au': '/icons/audio.png',
        'flac': '/icons/audio.png',
        'ape': '/icons/audio.png',
        'wv': '/icons/audio.png',
        'w4a': '/icons/audio.png',
        'flv': '/icons/play.png',
        'docs': '/icons/docs.png',
        'doc': '/icons/docs.png',
        'docx': '/icons/docs.png',
        'dotm': '/icons/docs.png',
        'docm': '/icons/docs.png',
        'dotx': '/icons/docs.png',
        'txt': '/icons/docs.png',
        'pdf': '/icons/pdf.png',
        'pptx': '/icons/pptx.png',
        'xlsx': '/icons/sheets.png',
        'gform': '/icons/gforms.png',
        'gjam': '/icons/jamboard.png',
        'gcolab': '/icons/gcolab.png',
        'gmap': '/icons/google-maps.png',
        'gdrawing': '/icons/google-drawings.png',
        'gscript': '/icons/google-apps-script.png',
        'gfusiontable': '/icons/google-drive-fusion-tables-logo.png',
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

        case 'application/vnd.google-apps.presentation':
            ext = 'pptx'
            break;

        case 'application/vnd.google-apps.script':
            ext = 'gscript'
            break;

        case 'application/vnd.google-apps.jam':
            ext = 'gjam'
            break;

        case 'application/vnd.google-apps.form':
            ext = 'gform'
            break;

        case 'application/vnd.google-apps.drawing':
            ext = 'gdrawing'
            break;

        case 'application/vnd.google-apps.fusiontable':
            ext = 'gfusiontable'
            break;

        case 'application/vnd.google-apps.map':
            ext = 'gmap'
            break;

        case 'application/vnd.google.colaboratory':
            ext = 'gcolab'
            break;

        case 'application/pdf':
            ext = 'pdf'
            break;

        case 'video/mp4':
            ext = 'mp4'
            break;

        default:
            break;
    }

    if (!ext) return '/icons/any.png';
    return IconExtensionMem.icons[ext] || '/icons/any.png';

}