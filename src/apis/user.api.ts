import { API_URL } from ".";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";
import handleHttpError from "../utils/handleHttpError";

async function changeAvatar(file: File): Promise<string> {

    const formData = new FormData();
    formData.append('avatar', file);

    try {

        const resp = await fetch(`${API_URL}/api/me/avatar`, {
            method: "PUT",
            body: formData,
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