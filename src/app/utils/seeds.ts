// import { Role } from "@prisma/prisma/enums"
// import { prisma } from "../lib/prisma"
// import { auth } from "../lib/auth"
// import { envVars } from "../config/env"

// export const seedSuperAdmin = async () => {
//     try {
//         //super admin availability check
//         const isSuperAdminExist = await prisma.user.findFirst({
//             where: {
//                 role: Role.SUPER_ADMIN
//             }
//         })

//         if (!isSuperAdminExist) {
//             console.log("Super admin already exist. Skipping seeding super admin")
//             return;
//         }

//         //crate super admin
//         const superAdminUser = await auth.api.signUpEmail({
//             body: {
//                 email: envVars.SUPER_ADMIN_EMAIL,
//                 password: envVars.SUPER_ADMIN_PASSWORD,
//                 role: Role.SUPER_ADMIN,
//                 name: "Super Admin",
//                 needPasswordChange: false,
//                 rememberMe: false
//             }
//         })

//         const result = await prisma.$transaction(async (tx) => {
//             await tx.user.update({
//                 where: {
//                     id: superAdminUser.user.id
//                 },
//                 data: {
//                     emailVerified: true,
//                 }
//             })

//             //craete admin data 
//             await tx.admin.create({
//                 data: {
//                     userId: superAdminUser.user.id,
//                     name: "Super Admin",
//                     email: envVars.SUPER_ADMIN_EMAIL,

//                 }
//             })

//         })

//         const superAdmin = await prisma.admin.findFirst({
//             where: {
//                 email: envVars.SUPER_ADMIN_EMAIL
//             },
//             include: {
//                 user: true,
//             }
//         })
//         console.log("Super admin created ", superAdmin)
//     } catch (error) {
//         console.error("Error seeding super admin", error);

//         //now delete the user
//         await prisma.user.delete({
//             where:{
//                 email:envVars.SUPER_ADMIN_EMAIL,
//             }
//         })
//     }
// }



import { Role } from "@prisma/prisma/enums";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN
            }
        })

        if (isSuperAdminExist) {
            console.log("Super admin already exists. Skipping seeding super admin.");
            return;
        }

        const superAdminUser = await auth.api.signUpEmail({
            body: {
                email: envVars.SUPER_ADMIN_EMAIL,
                password: envVars.SUPER_ADMIN_PASSWORD,
                name: "Super Admin",
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false,
            }
        })

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: {
                    id: superAdminUser.user.id
                },
                data: {
                    emailVerified: true,
                }
            });

            await tx.admin.create({
                data: {
                    userId: superAdminUser.user.id,
                    name: "Super Admin",
                    email: envVars.SUPER_ADMIN_EMAIL,
                }
            })



        });

        const superAdmin = await prisma.admin.findFirst({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL,
            },
            include: {
                user: true,
            }
        })

        console.log("Super Admin Created ", superAdmin);
    } catch (error) {
        console.error("Error seeding super admin: ", error);
        await prisma.user.delete({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL,
            }
        })
    }
}