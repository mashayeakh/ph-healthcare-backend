import express from 'express';
import { AuthController } from './auth.controller';
const route = express();


//!create patient
route.post(
    "/patient",
    AuthController.createPatient
)


export const AuthRouter = route;