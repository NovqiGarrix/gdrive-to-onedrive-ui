import { ERROR_500_MESSAGE } from "../constants";
import { HttpErrorExeption } from "../exeptions/httpErrorExeption";

export default function handleHttpError(error: any) {
    console.log(error, 'handleHttpError');
    if (error instanceof HttpErrorExeption) {
        throw error;
    }

    if (error.name === "AbortError" || error.name === "CanceledError") {
        throw new Error("Transfer cancelled");
    }

    throw new Error(ERROR_500_MESSAGE);
}