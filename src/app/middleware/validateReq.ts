import { ZodObject } from "zod";
import express, { NextFunction, Request, RequestHandler, Response } from "express";

export const validateReq = (zodSchema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsedResult = zodSchema.safeParse(req.body)

        if (!parsedResult.success) {
            next(parsedResult.error)
        }
        req.body = parsedResult.data;
        next();
    }
}

