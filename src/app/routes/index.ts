import express from 'express';
import { SpecialtyRouter } from '../modules/specialty/specialty.route';
import { AuthRouter } from '../modules/auth/auth.route';

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


export default route;