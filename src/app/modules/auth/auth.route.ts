import express from 'express';
import { AuthController } from './auth.controller';
import { checkAuth } from '@/app/middleware/checkAuth';
import { Role } from '@prisma/prisma/enums';
import { router } from 'better-auth/api';
const route = express();


//!create patient
route.post(
    "/patient/register",
    AuthController.createPatient
);

//! login patient
route.post(
    "/patient/login",
    AuthController.loginUser
)

//! own profile
route.get(
    "/me",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    AuthController.getMe
)

//!get new access token
route.post(
    "/refresh-token",
    AuthController.getNewToken
)


//! change pswd
route.post(
    "/change-password",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    AuthController.changePassword
)

//! logout user 
route.post(
    "/logout",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    AuthController.logout
)


//!verify email
route.post(
    "/verify-email",
    AuthController.verifyEmail
)


export const AuthRouter = route;