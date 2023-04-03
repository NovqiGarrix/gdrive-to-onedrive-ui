import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { toast } from 'react-hot-toast';

import { GlobalItemTypes } from '../types';
import { API_URL, defaultOptions } from '../apis';

import getFileBuffer from './getFileBuffer';

const NEXT_PUBLIC_INFILE_HELPER_URL = process.env.NEXT_PUBLIC_INFILE_HELPER_URL;
if (!NEXT_PUBLIC_INFILE_HELPER_URL) throw new Error('Missing NEXT_PUBLIC_INFILE_HELPER_URL from env variable');

export default async function zipAndDownloadFiles(files: Array<GlobalItemTypes>, toastId: string) {

    const zip = new JSZip();
    const dateInString = new Date().toISOString().replace(/:/g, '-');

    const providerId = files[0].from;
    let filesBuffer: Array<ArrayBuffer> = [];

    switch (providerId) {
        case 'google_photos': {
            filesBuffer = (await Promise.all(
                files.map(async (file) => {
                    try {
                        const resp = await fetch(`${NEXT_PUBLIC_INFILE_HELPER_URL}/api/v1/serve?url=${file.downloadUrl}`);
                        if (!resp.ok) return;

                        const buffer = await resp.arrayBuffer();
                        return buffer;
                    } catch (error) {
                        return undefined;
                    }
                })
            )).filter(Boolean) as Array<ArrayBuffer>;
            break;
        }

        case 'onedrive': {
            filesBuffer = (await Promise.all(
                files.map(async (file) => {
                    try {
                        const resp = await fetch(file.downloadUrl);
                        if (!resp.ok) return;

                        const buffer = await resp.arrayBuffer();
                        return buffer;
                    } catch (error) {
                        return undefined;
                    }
                })
            )).filter(Boolean) as Array<ArrayBuffer>;
            break;
        }

        case 'google_drive': {
            filesBuffer = (await Promise.all(
                files.map(async (file) => {

                    try {

                        const { arrayBuffer, permissionId } = await getFileBuffer({
                            file: {
                                providerId,
                                id: file.id,
                                name: file.name,
                                downloadUrl: file.downloadUrl,
                                iconLink: file.iconLink,
                            },
                            signal: new AbortController().signal,
                            providerId
                        });

                        if (permissionId) {
                            const deletePermissionResp = await fetch(`${API_URL}/api/google/drive/files/${file.id}/permissions/${permissionId}`, {
                                ...defaultOptions,
                                method: 'DELETE',
                            });

                            await deletePermissionResp.body?.cancel();
                        }

                        return arrayBuffer;

                    } catch (error) {
                        return undefined;
                    }

                })
            )).filter(Boolean) as Array<ArrayBuffer>;
            break;
        }

        default:
            throw new Error('Unsupported provider.');
    }

    if (!filesBuffer.length) {
        toast.error('No files to download', { id: toastId });
        return;
    }

    filesBuffer.forEach((buffer, index) => {
        zip.file(files[index].name, new Blob([buffer]), { binary: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(content, `infile_io-${dateInString}.zip`);

}