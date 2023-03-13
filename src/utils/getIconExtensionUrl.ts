
const availableIcons = [
    'AVI',
    'CRD',
    'CSV',
    'DOC',
    'DOCX',
    'EPS',
    'EXE',
    'MOV',
    'MP3',
    'MP4',
    'MPEG',
    'PDF',
    'PS',
    'PSD',
    'PPT',
    'PPTX',
    'RAR',
    'SVG',
    'TXT',
    'WAV',
    'XSL',
    'XLS',
    'ZIP'
];

export default function getIconExtensionUrl(filename: string): string {

    let ext = filename.split('.').pop()?.toUpperCase();
    if (ext === 'MKV') ext = 'MP4';

    if (ext && availableIcons.includes(ext)) return `/icons/${ext}.webp`;
    return `/icons/FILE.webp`;

}