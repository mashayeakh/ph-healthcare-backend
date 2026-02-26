import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../../prisma/generated/prisma/enums";
import { envVars } from "../config/env";
import ms, { StringValue } from "ms";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,

    database: prismaAdapter(prisma, {
        provider: "postgresql",

    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,

            mapProfileToUser: () => {
                return {
                    role: Role.PATIENT,
                    status: UserStatus.ACTIVE,
                    emailVerified: true,
                    isDeleted: false,
                    needPasswordChange: false,
                    deletedAt: null,
                }
            }
        }
    },



    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,

    },


    trustedOrigins: [
        // process.env.BETTER_AUTH_URL || "http://localhost:5000"
        envVars.BETTER_AUTH_URL ||
        `http://localhost:${envVars.PORT}`,
        envVars.FRONTEND_URL
    ],
    advanced: {
        // disableCSRFCheck: true
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/"
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/"
                }
            }
        }
    },

    plugins: [
        bearer(),

        //for otp
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                //otp , for email verificaton 
                if (type === "email-verification") {
                    //fetch the email 
                    const user = await prisma.user.findUnique({
                        where: {
                            email: email
                        }
                    })

                    if (user && !user.emailVerified) {
                        //now send the eamil with otp
                        sendEmail({
                            to: email,
                            subject: "Your OTP for email verification",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp: otp,
                            }
                        })
                    }
                }
                //otp , for forget password
                else if (type === "forget-password") {
                    //fetch the email 
                    const user = await prisma.user.findUnique({
                        where: {
                            email: email
                        }
                    })
                    if (user) {
                        sendEmail({
                            to: email,
                            subject: "Your OTP for password reset",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp: otp,
                            }
                        })
                    }
                }
            },
            //valid for 2mins
            expiresIn: 2 * 60,
            otpLength: 6 // 6 digit otp
        })
    ],
    session: {
        expiresIn: 60 * 60 * 60 * 24, // 1d,
        updateAge: 60 * 60 * 60 * 24, // 1d,

        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 60 * 24 // 1d
        }
    },

    redirectURLs: {
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/login/google/success`,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            }
        }
    }
});