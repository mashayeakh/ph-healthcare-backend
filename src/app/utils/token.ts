import { JwtPayload, SignOptions } from "jsonwebtoken";
import { createToken } from "./jwt";
import { envVars } from "../config/env";
import { setCookie } from "./cookies";
import { CookieOptions, Response } from "express";
import ms, { StringValue } from "ms";

//creating access token
export const getAccessToken = (payload: JwtPayload) => {
    const accessToken = createToken(
        payload,
        envVars.ACCESS_TOKEN_SECRET,
        {
            expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN
        } as SignOptions
    );
    return accessToken;
}



//creating refresh token
export const getRegreshtoken = (payload: JwtPayload) => {
    const accessToken = createToken(
        payload,
        envVars.REFRESH_TOKEN_SECRET,
        {
            expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN
        } as SignOptions
    );
    return accessToken;
}


//set the Access token cookie
export const setAccessTokenCookie = (res: Response, token: string) => {
    const maxAge = ms((envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue));
    console.log("MAX AGE =", maxAge)
    setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        // maxAge: Number(maxAge)
        maxAge: 60 * 60 * 60 * 24 * 1000 // 1d
    });
}

//set refresh token cookie
export const setRefreshTokenCookie = (res: Response, token: string) => {
    // const maxAge = ms((envVars.REFRESH_TOKEN_EXPIRES_IN as StringValue))
    setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        // maxAge: Number(maxAge)
        maxAge: 60 * 60 * 60 * 24 * 7 * 1000 // 7d

    })
}

//better auth session cookie
export const setBetterAuthSessionCookie = (res: Response, token: string) => {
    // const maxAge = ms((envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue))
    setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        // maxAge: Number(maxAge)
        maxAge: 60 * 60 * 60 * 24 * 1000 // 1d
    })
}