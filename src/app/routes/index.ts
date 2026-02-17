import express from 'express';
import { SpecialtyRouter } from '../modules/specialty/specialty.route';
import { AuthRouter } from '../modules/auth/auth.route';
import { UserRouter } from '../user/user.route';
import { DoctorRouter } from '../modules/doctor/doctor.route';

const route = express();


//!specialty
route.use(
    "/specialty",
    SpecialtyRouter
);

//!auth
route.use(
    "/auth",
    AuthRouter
);

//!user
route.use(
    "/user",
    UserRouter
);

//!doctor
route.use(
    "/doctors",
    DoctorRouter
)


export default route;