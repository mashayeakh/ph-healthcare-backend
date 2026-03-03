import express from 'express';
import { DoctorController } from './doctor.controller';
import { checkAuth } from '@/app/middleware/checkAuth';
import { Role } from '@prisma/prisma/enums';
const route = express();


//!get all doctors
route.get(
    "/",
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
    DoctorController.viewAllDoctor
);

//!get specific doctor by id
route.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
    DoctorController.viewSingleDoctorById
);

//!soft delete by id
route.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorController.softDeleteById
);

//!update doctor
route.patch(
    "/:id/update",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
    DoctorController.updateDoctor
);



export const DoctorRouter = route;