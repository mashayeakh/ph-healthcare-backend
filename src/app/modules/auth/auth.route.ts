import express from 'express';
import { AuthController } from './auth.controller';
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


export const AuthRouter = route;