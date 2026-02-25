import { UserStatus } from "@prisma/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { SpecialtyType, UpdateSpecialType } from "../specialty/dto/specialtyDto";
import { Request, Response } from "express";
import { AppError } from "@/app/errorHelpers/AppError";
import status from "http-status";
import { getAccessToken, getRegreshtoken } from "@/app/utils/token";
import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { vefiryToken } from "@/app/utils/jwt";
import { envVars } from "@/app/config/env";
import { JwtPayload } from "jsonwebtoken";


export const AuthService = {

    //! patient registration 
    async registerPatient(payload: IRegisterPatientPayload, res: Response) {
        const {
            name,
            email,
            password
        } = payload;

        //using better auth signupEmail api to create
        const data = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password
            }
        });

        if (!data.user) {
            // throw new Error("Failed to register patient");
            throw new AppError(status.BAD_REQUEST, "Failed to register patient")
        }

        //since by default user is patient, we want once he is registered, his profile will be created automatically, without that, the profile wont be created. 

        try {
            const patient = await prisma.$transaction(async (tx) => {
                //create the patient
                return await tx.patient.create({
                    //what to put in the profile, we will define here
                    data: {
                        userId: data.user.id,
                        name: payload.name,
                        email: payload.email,
                    }
                })
            })

            //get the access token - short time
            const accessToken = getAccessToken({
                userId: data.user.id,
                role: data.user.role,
                name: data.user.name,
                email: data.user.email,
                status: data.user.status,
                isDeleated: data.user.isDeleted,
                emailVerified: data.user.emailVerified,
            });
            //get the refresh token - long time
            const refreshToken = getRegreshtoken({
                userId: data.user.id,
                role: data.user.role,
                name: data.user.name,
                email: data.user.email,
                status: data.user.status,
                isDeleated: data.user.isDeleted,
                emailVerified: data.user.emailVerified,
            });

            return {
                ...data,
                token: data.token,
                accessToken,
                refreshToken,
                patient
            };
        } catch (error) {
            console.log("Transaction error ", error);
            //if patient is registered but profile is not created then we can delete the patient manually
            await prisma.user.delete({
                where: {
                    id: data.user.id
                }
            })
            throw error;

        }
    },


    //!patient login

    async loginPatient(payload: ILoginUserPayload) {

        const { email, password } = payload

        //better auth sign in
        const data = await auth.api.signInEmail({
            body: {
                email,
                password
            }
        })

        //verification
        if (data.user.status === UserStatus.BLOCKED) {
            // throw new Error("User is blocked");
            throw new AppError(status.FORBIDDEN, "User is blocked")
        }

        //you can do some other verification as well. 

        //get the access token - short time
        const accessToken = getAccessToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleated: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        });
        //get the refresh token - long time
        const refreshToken = getRegreshtoken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleated: data.user.isDeleted,
            emailVerified: data.user.emailVerified,
        });
        return {
            ...data,
            accessToken,
            refreshToken
        };
    },

    //! fetch full profile of the user
    async getMe(user: IRequestUser) {
        const isExist = await prisma.user.findUnique({
            where: {
                id: user.userId
            },
            include: {
                patient: {
                    include: {
                        appointments: true,
                        reviews: true,
                        prescriptions: true,
                        medicalReports: true,
                        patientHealthData: true,
                    }
                },
                doctor: {
                    include: {
                        specialties: true,
                        appointments: true,
                        reviews: true,
                        prescriptions: true,
                    }
                }
            }
        })
        if (!isExist) {
            throw new AppError(status.NOT_FOUND, "User not found");
        }
        return isExist;
    },


    //! get new access token using refresh token
    async getNewToken(refreshToken: string, sessionToken: string) {

        //verify the refresh token. 
        const verifiedRefreshToken = vefiryToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);

        console.log("---- verifiend  refresh token ", verifiedRefreshToken)

        if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
            throw new AppError(status.UNAUTHORIZED, "Invalid refresh token")
        }

        const data = verifiedRefreshToken.data as JwtPayload

        // generate new access token
        const newAccessToken = getAccessToken({
            userId: data.userId,
            role: data.role,
            name: data.name,
            email: data.email,
            status: data.status,
            isDeleated: data.isDeleted,
            emailVerified: data.emailVerified,
        });

        //get the refresh token - long time (because when refresh is expired, then how will refresh token crate another access token, so we need to generate new refresh token as well) 
        const newRefreshToken = getRegreshtoken({
            userId: data.userId,
            role: data.role,
            name: data.name,
            email: data.email,
            status: data.status,
            isDeleated: data.isDeleted,
            emailVerified: data.emailVerified,
        });

        //we will also check the session token. if the session token is valid then we will incraese it by 1d. it means update with day 1. 
        const isSessionTokenExist = await prisma.session.findUnique({
            where: {
                token: sessionToken,
                expiresAt: {
                    gt: new Date()// it means only find the session which is not expired yet.
                },
            },
            include: {
                user: true,
            }
        });

        if (!isSessionTokenExist) {
            throw new AppError(status.UNAUTHORIZED, "Invalid session token");
        }

        //now update the token with new expire time
        const upddatedSession = await prisma.session.update({
            where: {
                token: sessionToken,
            },
            data: {
                token: sessionToken,
                expiresAt: new Date((Date.now() + 60 * 60 * 60 * 24 * 1000)),
                updatedAt: new Date(),
            }
        })
        const { token } = upddatedSession
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            sessionToken: token
        }
    },

    //!change pswd 
    async changePassword(payload: IChangePswdPayload, sessionToken: string) {
        //we will get the user from the session token with using better auth. 
        const userSession = await auth.api.getSession({
            headers: {
                AUTHORIZATION: `Bearer ${sessionToken}`
            }
        })
        console.log("---User found ", userSession)
        if (!userSession || !userSession.user) {
            throw new AppError(status.UNAUTHORIZED, "Invalid session token")
        }

        //now extract curr pswd and new pswd from the payload
        const {
            currentPassword,
            newPassword
        } = payload

        const result = await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions: true,// it means, sob site theke logout hoye jabe, once he change the password except the curr session.
            },
            //also pass the header so that better auth can identify the user and the change the paswd
            headers: {
                AUTHORIZATION: `Bearer ${sessionToken}`
            }
        })

        // generate new access token
        const accessToken = getAccessToken({
            userId: userSession.user.id,
            role: userSession.user.role,
            name: userSession.user.name,
            email: userSession.user.email,
            status: userSession.user.status,
            isDeleated: userSession.user.isDeleted,
            emailVerified: userSession.user.emailVerified,
        });

        //get the refresh token - long time (because when refresh is expired, then how will refresh token crate another access token, so we need to generate new refresh token as well) 
        const refreshToken = getRegreshtoken({
            userId: userSession.user.id,
            role: userSession.user.role,
            name: userSession.user.name,
            email: userSession.user.email,
            status: userSession.user.status,
            isDeleated: userSession.user.isDeleted,
            emailVerified: userSession.user.emailVerified,
        });


        console.log("---- reulth", result)
        return {
            ...result,
            accessToken,
            refreshToken,

        };
    },

    //!logout 
    async logout(sessionToken: string) {
        return await auth.api.signOut({
            headers: {
                AUTHORIZATION: `Bearer ${sessionToken}`
            }
        })
    },

    //!vefiry email
    async verifedEmail(email: string, otp: string) {
        //get the verify email otp from better auth
        const result = await auth.api.verifyEmailOTP({
            body: {
                email,
                otp,
            }
        })

        //check if the otp is correct and if the email is verified then update the emailVerified field in the user table.
        if (result.status && !result.user.emailVerified) {
            await prisma.user.update({
                where: {
                    email: email,
                },
                data: {
                    emailVerified: true
                }
            })
        }
    },

    //!forget password
    async forgetPassword(email: string) {
        const isUserExist = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!isUserExist) {
            throw new AppError(status.NOT_FOUND, "User not found")
        }

        if (isUserExist && !isUserExist.emailVerified) {
            throw new AppError(status.BAD_REQUEST, "Email is not verified. ")
        }

        if (isUserExist && isUserExist.isDeleted) {
            throw new AppError(status.BAD_REQUEST, "User is deleted. ")
        }

        //Request pass for reset email otp from better auth
        return await auth.api.requestPasswordResetEmailOTP({
            body: {
                email: email,
            }
        })
    },

    //!Reset password
    async resetPassword(email: string, otp: string, newPassword: string) {
        const isUserExist = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!isUserExist) {
            throw new AppError(status.NOT_FOUND, "User not found")
        }

        if (isUserExist && !isUserExist.emailVerified) {
            throw new AppError(status.BAD_REQUEST, "Email is not verified. ")
        }

        if (isUserExist && isUserExist.isDeleted) {
            throw new AppError(status.BAD_REQUEST, "User is deleted. ")
        }

        //now actual pass change pert 
        await auth.api.resetPasswordEmailOTP({
            body: {
                email: email,
                otp: otp,
                password: newPassword
            }
        })

        //when pass is reset then we will also revoke all the sessions of the user, so that he will be logged out from all the devices.
        await prisma.session.deleteMany({
            where: {
                userId: isUserExist.id
            }
        })
    }
} 