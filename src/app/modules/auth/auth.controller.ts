import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";



export const AuthController = {

    /**
     *  httpStatusCode,
        success,
        message,
        result
     */
    createPatient: async (req: Request, res: Response) => {

        const data = await AuthService.registerPatient(req.body, res)

        if (data.token) {
            res.cookie('better-auth.session_token', data.token, {
                httpOnly: true,
                secure: false, // Set to false for local development (HTTP)
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
        }


        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: "Patient Registered successfully",
            result: data
        })
    },

    loginUser: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("**Controller hit ",)
            sendResponse(res, {
                httpStatusCode: 200,
                success: true,
                message: "User logged in successfully",
                result: await AuthService.loginPatient(req.body)
            })
        }
    )

};
