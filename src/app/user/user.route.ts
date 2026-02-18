import { UserController } from './user.controller';
import z, { ZodObject } from 'zod';
import { deprecate } from 'node:util';
import { DoctorGender } from '@prisma/prisma/enums';
import express, { NextFunction, Request, RequestHandler, Response } from "express";
import { validateReq } from '../middleware/validateReq';
import { createDoctorZodSchema } from './user.validation';

const route = express();


//!create doct
route.post(
    "/doc/register",
    validateReq(createDoctorZodSchema),
    UserController.createDoctorUser
);




export const UserRouter = route;