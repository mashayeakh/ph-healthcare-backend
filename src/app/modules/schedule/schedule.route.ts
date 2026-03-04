import express, { NextFunction, Request, Response } from 'express';
// import { SpecialtyController } from './specialty.controller';
import { getAccessToken } from '@/app/utils/token';
import { getCookie } from '@/app/utils/cookies';
import { AppError } from '@/app/errorHelpers/AppError';
import status from 'http-status';
import { vefiryToken } from '@/app/utils/jwt';
import { envVars } from '@/app/config/env';
import { success } from 'zod';
import { Role } from '@prisma/prisma/enums';
import { checkAuth } from '@/app/middleware/checkAuth';
import multer from 'multer';
import { multerUpload } from '@/app/config/multer.config';
import { ScheduleController } from './schedule.controller';
import { validateAuthorizationCode } from 'better-auth';
import { validateReq } from '@/app/middleware/validateReq';
import { createDoctorZodSchema } from '../user/user.validation';
import { createScheduleValidationSchema } from './schedule.validation';
const route = express();

//!Create schedule
route.post(
    "/",
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
    validateReq(createScheduleValidationSchema),
    ScheduleController.scheduleCreate
);

// //! get all specialties
// route.get(
//     "/",
//     // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
//     ScheduleController.getAllSpecialty
// );

// //! delete any specialty based on id
// route.delete(
//     "/:id",
//     SpecialtyController.deleteSpecialty
// );

// //!update any specialty based on id
// route.put(
//     "/:id",
//     SpecialtyController.editSpecialty
// )



export const ScheduleRouter = route;