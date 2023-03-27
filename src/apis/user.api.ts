import { API_URL } from ".";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";
import handleHttpError from "../utils/handleHttpError";

async function changeAvatar(file: File): Promise<string> {

    try {

        const arrayBuffer = await file.arrayBuffer();

        const resp = await fetch(`${API_URL}/api/me/avatar?filename=${file.name}`, {
            headers: {
                "Content-Type": "application/octet-stream"
            },
            method: "PUT",
            body: arrayBuffer,
            credentials: "include"
        });

        const { errors, data } = await resp.json();

        if (!resp.ok) {
            throw new HttpErrorExeption(resp.status, errors[0].error);
        }

        return data.avatar;

    } catch (error) {
        throw handleHttpError(error);
    }

}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    changeAvatar
}