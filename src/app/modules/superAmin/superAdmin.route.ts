import express from 'express';
import { checkAuth } from '@/app/middleware/checkAuth';
import { Role } from '@prisma/prisma/enums';
import { SuperAdminController } from './superAdmin.controller';
const route = express();


//!get all super-admin
route.get(
    "/",
    // checkAuth(Role.SUPER_ADMIN),
    SuperAdminController.viewAllSuperAdmin
);

// //!get specific admin by id
route.get(
    "/:id",
    // checkAuth(Role.SUPER_ADMIN),
    SuperAdminController.viewSingleSuperAdminById
);

// //!soft delete by id
route.patch(
    "/:id",
    // checkAuth(Role.SUPER_ADMIN),
    SuperAdminController.softDeleteById
);

// //!update super-admin
route.patch(
    "/:id/update",
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    SuperAdminController.updateSuperAdmin
);



export const SuperAdminRouter = route;