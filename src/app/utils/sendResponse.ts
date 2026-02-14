import { NextFunction, Request, RequestHandler, Response } from "express";


interface IResponseData<T> {
    httpStatusCode: number,
    success: boolean,
    message: string,
    result?: T;
}


//!send Response
export const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
    const {
        httpStatusCode,
        success,
        message,
        result
    } = responseData;

    res.status(httpStatusCode).json({
        success,
        message,
        result
    })
}
