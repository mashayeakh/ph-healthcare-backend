import express, { NextFunction, Request, Response } from 'express';
import { checkAuth } from '@/app/middleware/checkAuth';
import { Role } from '@prisma/prisma/enums';
import { PatientCotroller } from './patient.controller';
import { multerUpload } from '@/app/config/multer.config';
import { validateReq } from '@/app/middleware/validateReq';
import { PatientValidation } from './patient.validation';
import { IUpdateAdminPayload } from '../admin/dto/updateAdminDto';
import { IUpdatePatientProfilePayload, IUpdatePatientInfoPayload } from './patient.interface';
import { updateMyPatientProfileMiddleware } from './patient.middleware';
const route = express();




//!update patient
route.patch(
    "/update-my-profile",
    checkAuth(Role.PATIENT),
    multerUpload.fields([
        {
            name: "profilePhoto", maxCount: 1
        },
        {
            name: "medicalReports", maxCount: 5
        }
    ]),
    updateMyPatientProfileMiddleware,
    validateReq(PatientValidation.updatePatientProfileZodSchema),
    PatientCotroller.updateMyProfile
);


export const PatientRouter = route


