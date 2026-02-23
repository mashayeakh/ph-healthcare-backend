import express from 'express';
import { checkAuth } from '@/app/middleware/checkAuth';
import { Role } from '@prisma/prisma/enums';
import { AdminController } from './admin.controller';
const route = express();


//!get all admins
route.get(
    "/",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    AdminController.viewAllAdmin
);

// //!get specific admin by id
route.get(
    "/:id",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    AdminController.viewSingleAdminById
);

// //!soft delete by id
route.patch(
    "/:id",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.softDeleteById
);

// //!update doctor
route.patch(
    "/:id/update",
    checkAuth(Role.SUPER_ADMIN),
    AdminController.updateAdmin
);



export const AdminRouter = route;