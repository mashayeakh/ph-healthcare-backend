import { UserController } from './user.controller';
import z, { ZodObject } from 'zod';
import { deprecate } from 'node:util';
import { DoctorGender, Role } from '@prisma/prisma/enums';
import express, { NextFunction, Request, RequestHandler, Response } from "express";
import { validateReq } from '../../middleware/validateReq';
import { createAdminZodSchema, createDoctorZodSchema } from './user.validation';
import { checkAuth } from '@/app/middleware/checkAuth';

const route = express();


//!create doct
route.post(
    "/doc/register",
    validateReq(createDoctorZodSchema),
    UserController.createDoctorUser
);


//!create admin
route.post(
    "/admin/register",
    checkAuth(Role.SUPER_ADMIN),
    validateReq(createAdminZodSchema),
    UserController.createAdminUser
);


//!create admin
route.post(
    "/super-admin/register",
    // checkAuth(Role.SUPER_ADMIN),
    // validateReq(createAdminZodSchema),
    UserController.createSuperAdminUser
);





export const UserRouter = route;