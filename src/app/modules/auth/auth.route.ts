import express from 'express';
import { AuthController } from './auth.controller';
import { checkAuth } from '@/app/middleware/checkAuth';
import { Role } from '@prisma/prisma/enums';
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
    AuthController.getNewToken)




export const AuthRouter = route;