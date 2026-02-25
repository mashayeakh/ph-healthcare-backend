import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { setAccessTokenCookie, setBetterAuthSessionCookie, setRefreshTokenCookie } from "@/app/utils/token";
import { envVars } from "@/app/config/env";
import ms, { StringValue } from "ms";
import { AppError } from "@/app/errorHelpers/AppError";
import { clearCookie } from "@/app/utils/cookies";



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
    ),

    getMe: catchAsyc(
        async (req: Request, res: Response) => {
            const user = req.user
            console.log("USER ", user)
            const data = await AuthService.getMe(user);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "User profile fetched successfully",
                result: data
            })
        }
    ),

    //!get new Token
    getNewToken: catchAsyc(
        async (req: Request, res: Response) => {
            //get the refresh token from cookie 
            const refreshToken = req.cookies['refreshToken'];
            const betterAuthSessionToken = req.cookies['better-auth.session_token'];

            if (!refreshToken) {
                throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
            }
            const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

            const {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            } = result;

            setAccessTokenCookie(res, accessToken);
            setRefreshTokenCookie(res, newRefreshToken);
            setBetterAuthSessionCookie(res, sessionToken);

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "New access token generated successfully",
                result: {
                    accessToken,
                    refreshToken: newRefreshToken,
                    sessionToken,
                }
            })
        }
    ),

    //!change pswd
    changePassword: catchAsyc(
        async (req: Request, res: Response) => {
            const sessionToken = req.cookies['better-auth.session_token'];
            if (!sessionToken) {
                throw new AppError(status.UNAUTHORIZED, "Session token is missing");
            }

            const result = await AuthService.changePassword(req.body, sessionToken);

            const {
                accessToken,
                refreshToken,
                token
            } = result

            setAccessTokenCookie(res, accessToken);
            setRefreshTokenCookie(res, refreshToken);
            setBetterAuthSessionCookie(res, token as string);

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Password changed successfully",
                result
            })
        }
    ),

    logout: catchAsyc(
        async (req: Request, res: Response) => {
            const betterAuthSessiontoken = req.cookies["better-auth.session_token"];

            const result = await AuthService.logout(betterAuthSessiontoken);

            //clear the cookies - access tokene
            clearCookie(res, 'accessToken', {
                httpOnly: true,
                secure: false,
                sameSite: "none",
            });
            //clear the cookies - refresh tokene
            clearCookie(res, 'refreshToken', {
                httpOnly: true,
                secure: false,
                sameSite: "none",
            });
            //clear the cookies - better-auth-session tokene
            clearCookie(res, 'better-auth.session_token', {
                httpOnly: true,
                secure: false,
                sameSite: "none",
            });

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "User logged outp successfully",
                result
            })
        }
    ),
    verifyEmail: catchAsyc(
        async (req: Request, res: Response) => {
            const { email, otp } = req.body;
            const result = await AuthService.verifedEmail(email, otp);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Email verified successfully",
                result
            })
        }
    ),

    //!forgot password
    forgotPassword: catchAsyc(
        async (req: Request, res: Response) => {
            const { email } = req.body;
            const result = await AuthService.forgetPassword(email);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Password reset otp sent  successfully",
                result
            })
        }
    ),

    //!reset password
    resetPassword: catchAsyc(
        async (req: Request, res: Response) => {
            const { email, otp, newPassword } = req.body;
            const result = await AuthService.resetPassword(email, otp, newPassword);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Password reset successfully",
                result
            })
        }
    ),

}
