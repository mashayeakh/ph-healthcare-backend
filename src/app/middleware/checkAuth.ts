import { Role, UserStatus } from "@prisma/prisma/enums";
import express, { NextFunction, Request, Response } from 'express';
import { getCookie } from "../utils/cookies";
import { AppError } from "../errorHelpers/AppError";
import status from "http-status";
import { envVars } from "../config/env";
import { vefiryToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";

export const checkAuth = (...authRoles: Role[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            //! checking for session token
            //1 - check if any user logged in or not with session
            const sessionToken = getCookie(req, "better-auth.session_token");
            if (!sessionToken) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session token provided");
            }

            //if i have the session token then you must check wheather it exists in db or not

            if (sessionToken) {
                const sessionExists = await prisma.session.findFirst({
                    where: {
                        token: sessionToken,
                        expiresAt: {
                            gt: new Date()
                        }
                    },
                    include: {
                        user: true
                    }

                })
                if (sessionExists && sessionExists.user) {
                    //get the user
                    const user = sessionExists.user;

                    const now = new Date();
                    const expiresAt = sessionExists.expiresAt
                    const createdAt = sessionExists.createdAt

                    const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                    const timeRemaining = expiresAt.getTime() - now.getTime();
                    const percentRemaining = (timeRemaining / sessionLifeTime) * 100;


                    if (percentRemaining < 20) {
                        //send alert in the header
                        res.setHeader("X-Session-Refresh", "true")
                        res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
                        res.setHeader("X-time-Remaining", timeRemaining.toString());

                        console.log("Session expiring soon!!!")
                    }

                    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is not active")
                    }

                    if (user.isDeleted) {
                        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is deleted")
                    }

                    if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                        throw new AppError(status.FORBIDDEN, "Forbideen access!! You do not have permission to access this resource");
                    }
                    return next()
                }
            }
            //! now working for jwt - checking for access token
            //get the access token using getCookie
            const accessToken = getCookie(req, "accessToken");
            console.log("----Access Token found ", accessToken)
            if (!accessToken) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No access token provided");
            }
            //verify the token
            const verifiedtoken = vefiryToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

            console.log("Token to be verified = ", verifiedtoken)
            if (!verifiedtoken.success) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid access token");
            }
            //stop if you are not admin
            if (authRoles.length > 0 && !authRoles.includes(verifiedtoken.data!.role as Role)) {
                throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this");

            }
            next();
        } catch (error: any) {
            next(error)
        }
    }


