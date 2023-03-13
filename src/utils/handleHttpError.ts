import { ERROR_500_MESSAGE } from "../constants";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

export default function handleHttpError(error: any) {
    if (error instanceof HttpErrorExeption) {
        throw error;
    }

    throw new Error(ERROR_500_MESSAGE);
}