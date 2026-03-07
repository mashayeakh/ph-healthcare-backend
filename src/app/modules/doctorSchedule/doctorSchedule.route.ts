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
import { validateAuthorizationCode } from 'better-auth';
import { validateReq } from '@/app/middleware/validateReq';
import { createDoctorZodSchema } from '../user/user.validation';
import { Doctor } from '@prisma/prisma/client';
import { DoctorScheduleController } from './doctorSchedule.controller';
const route = express();

//!Create doctor schedule
route.post(
    "/create-my-doctor-schedule",
    checkAuth(Role.DOCTOR),
    DoctorScheduleController.createMyDoctSchedule
)
//! Update doctor schedule
route.patch(
    "/update-my-doctor-schedule",
    checkAuth(Role.DOCTOR),
    DoctorScheduleController.updateMyDoctSchedule
)

//! all 
route.get(
    "/my-doctor-schedule",
    checkAuth(Role.DOCTOR),
    DoctorScheduleController.getMyDoctSchedule
)



export const ScheduleRouter = route;