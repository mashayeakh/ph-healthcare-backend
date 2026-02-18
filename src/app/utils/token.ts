import { JwtPayload, SignOptions } from "jsonwebtoken";
import { createToken } from "./jwt";
import { envVars } from "../config/env";

//get the access token
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



//get the refresh token
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
