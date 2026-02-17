import express from 'express';
import { DoctorController } from './doctor.controller';
const route = express();


//!get all doctors
route.get(
    "/",
    DoctorController.viewAllDoctor
);

//!get specific doctor by id
route.get(
    "/:id",
    DoctorController.viewSingleDoctorById
);

//!soft delete by id
route.patch(
    "/:id",
    DoctorController.softDeleteById
);

//!update doctor
route.patch(
    "/:id/update",
    DoctorController.updateDoctor
);



export const DoctorRouter = route;