import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { setAccessTokenCookie, setBetterAuthSessionCookie, setRefreshTokenCookie } from "@/app/utils/token";
import { envVars } from "@/app/config/env";
import ms, { StringValue } from "ms";



export const AuthController = {

    /**
     *  httpStatusCode,
        success,
        message,
        result
     */
    createPatient: async (req: Request, res: Response) => {

        const maxAge = ms((envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue));
        console.log({ maxAge })
        const data = await AuthService.registerPatient(req.body, res)
        // if (data.token) {
        //     res.cookie('better-auth.session_token', data.token, {
        //         httpOnly: true,
        //         secure: false, // Set to false for local development (HTTP)
        //         sameSite: 'lax',
        //         maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        //     });
        // }

        const {
            accessToken,
            refreshToken,
            token,
            ...rest
        } = data

        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);
        setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Patient Registered successfully",
            result: {
                token,
                accessToken,
                refreshToken,
                ...rest,
            }
        })
    },

    loginUser: catchAsyc(
        async (req: Request, res: Response) => {
            const result = await AuthService.loginPatient(req.body)
            const {
                accessToken,
                refreshToken,
                token,
                ...rest
            } = result

            setAccessTokenCookie(res, accessToken);
            setRefreshTokenCookie(res, refreshToken);
            setBetterAuthSessionCookie(res, token);

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "User logged in successfully",
                result: {
                    token,
                    accessToken,
                    refreshToken,
                    ...rest
                }
            })
        }
    )

};
