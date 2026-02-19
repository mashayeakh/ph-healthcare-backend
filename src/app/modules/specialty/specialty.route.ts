import express, { NextFunction, Request, Response } from 'express';
import { SpecialtyController } from './specialty.controller';
import { getAccessToken } from '@/app/utils/token';
import { getCookie } from '@/app/utils/cookies';
import { AppError } from '@/app/errorHelpers/AppError';
import status from 'http-status';
import { vefiryToken } from '@/app/utils/jwt';
import { envVars } from '@/app/config/env';
import { success } from 'zod';
import { Role } from '@prisma/prisma/enums';
import { checkAuth } from '@/app/middleware/checkAuth';
const route = express();


route.post(
    "/",
    SpecialtyController.specialtyCreate
);

route.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
    SpecialtyController.getAllSpecialty
);

route.delete(
    "/:id",
    SpecialtyController.deleteSpecialty
);

route.put(
    "/:id",
    SpecialtyController.editSpecialty
)



export const SpecialtyRouter = route;