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

route.post(
    "/patient/login",
    AuthController.loginUser
)

route.get(
    "/me",
    checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
    AuthController.getMe
)

export const AuthRouter = route;