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

export async function cancelGoogleUploadSession(sessionId: string) {

    const cancelResp = await fetch(`${API_URL}/api/google/files/uploadSessions/${sessionId}/cancel`, {
        ...defaultOptions,
        method: "PUT"
    });

    await cancelResp.body?.cancel();

}

export async function cancelMicrosoftUploadSession(sessionId: string) {

    const cancelResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions/${sessionId}/cancel`, {
        ...defaultOptions,
        method: "PUT"
    });

    await cancelResp.body?.cancel();

}

export async function createMicorosftUploadSession(signal: AbortSignal) {

    const registerResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions`, {
        ...defaultOptions,
        signal,
        method: "POST"
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

export async function completeMicrosoftUploadSession(sessionId: string, signal: AbortSignal) {

    const completeResp = await fetch(`${API_URL}/api/microsoft/files/uploadSessions/${sessionId}/complete`, {
        ...defaultOptions,
        signal,
        method: "PUT"
    });

    const { errors: completeErrors } = await completeResp.json();

    if (!completeResp.ok) {
        throw new HttpErrorExeption(completeResp.status, completeErrors[0].error);
    }

}