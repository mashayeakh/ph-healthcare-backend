import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { success } from "zod";

/**
 * * 3 steps
 *  * a- createToken()
 *  * b- verifyToken()
 *  * c- decodeToken()
 */


//! create Token : stpes👇
//? step1 - take user info as payload and payload er type hobe jwt payload and one secret (impt we will put in env) and kichu options like expire date dibo-> type hobe SignOptions
//? step2 - generate the token using jwt.sign method which accepts payload, secrect, and expiresIn

export const createToken = (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => {
    const token = jwt.sign(payload, secret, { expiresIn })
    console.log("***Token generates : ", token)
    return token;
}

//!verify token: stpes👇
//? step1 - take token and secret to verify, use try catch
//? step2 - now verify the token with using jwt.verify()

export const vefiryToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        console.log("***Decoded token with token and secret: ", decoded)

        return {
            success: true,
            data: decoded
        }

    } catch (error: any) {
        // throw error;
        return {
            success: false,
            message: error.message,
            error
        }
    }
}


//! decode Token stpes👇
//? step1- pass the token as parameter
//? step2- it just use jwt.decode() to decode the token thats it. 

export const decodedToken = (token: string) => {
    const decoded = jwt.decode(token) as JwtPayload;
    console.log("👉👉👉Decoded token only: ", decoded)
    return decoded;
}