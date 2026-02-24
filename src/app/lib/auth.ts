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
    database: prismaAdapter(prisma, {
        provider: "postgresql",

    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },


    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,


    },


    trustedOrigins: [
        // process.env.BETTER_AUTH_URL || "http://localhost:5000"
        envVars.BETTER_AUTH_URL || `http://localhost:${envVars.PORT}`
    ],
    // advanced: {
    //     disableCSRFCheck: true
    // },

    plugins: [
        bearer(),

        //for otp
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
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