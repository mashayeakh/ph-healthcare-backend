import express from 'express';
import { SpecialtyRouter } from '../modules/specialty/specialty.route';
import { AuthRouter } from '../modules/auth/auth.route';
import { UserRouter } from '../modules/user/user.route';
import { DoctorRouter } from '../modules/doctor/doctor.route';
import { AdminRouter } from '../modules/admin/admin.route';
import { SuperAdminRouter } from '../modules/superAmin/superAdmin.route';

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
);

//!admin
route.use(
    "/admin",
    AdminRouter
);

//!super-admin
route.use(
    "/super-admin",
    SuperAdminRouter
);


export default route;