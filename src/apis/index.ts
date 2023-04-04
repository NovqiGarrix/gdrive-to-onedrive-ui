import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const defaultOptions: RequestInit = {
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include'
}

interface ICreateGoogleUploadSessionReturn {
    sessionId: string;
    accessToken: string;
}

export async function createGoogleUploadSession(signal: AbortSignal): Promise<ICreateGoogleUploadSessionReturn> {

    const registerResp = await fetch(`${API_URL}/api/google/files/uploadSessions`, {
        ...defaultOptions,
        signal,
        method: "POST",
    });

    const registerRespData = await registerResp.json();
    if (!registerResp.ok) {
        throw new HttpErrorExeption(registerResp.status, registerRespData.errors[0].error);
    }

    const { sessionId, fileId } = registerRespData.data;
    const accessToken = fileId.split(':')[1];

    return {
        sessionId,
        accessToken
    }

}

export async function deleteGoogleDriveFilePermission(fileId: string, permissionId: string) {

    const deletePermissionResp = await fetch(`${API_URL}/api/google/drive/files/${fileId}/permissions/${permissionId}`, {
        ...defaultOptions,
        method: 'DELETE',
    });

    await deletePermissionResp.body?.cancel();

}

export async function cancelGoogleUploadSession(sessionId: string) {

    const cancelResp = await fetch(`${API_URL}/api/google/files/uploadSessions/${sessionId}/cancel`, {
        ...defaultOptions,
        method: "PUT"
    });

    await cancelResp.body?.cancel();

}

export async function cancelOnedriveUploadSession(sessionId: string) {

    const cancelResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions/${sessionId}/cancel`, {
        ...defaultOptions,
        method: "PUT"
    });

    await cancelResp.body?.cancel();

}