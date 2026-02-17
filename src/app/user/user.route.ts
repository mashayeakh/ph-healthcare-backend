import express from 'express';
import { UserController } from './user.controller';
const route = express();


//!create doct
route.post(
    "/doc/register",
    UserController.createDoctorUser
);




export const UserRouter = route;