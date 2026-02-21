import status from "http-status";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import z from "zod";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
    const errorSource: TErrorSources[] = []

    let stautsCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server Error";


    err.issues.forEach(issue => {
        errorSource.push({
            path: issue.path.join(" -> "),
            message: issue.message
        })
    })

    return {
        stautsCode,
        success: false,
        message,
        errorSource,
    }
}