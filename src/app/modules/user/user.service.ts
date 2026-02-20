import { Role } from "@prisma/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctoraPayload } from "./dto/doctorDto";
import { Specialty } from "@prisma/prisma/client";
import { AppError } from "../../errorHelpers/AppError";
import status from "http-status";
import { tr } from "zod/locales";
import { ICreateAdmin } from "./dto/adminDto";


/*
    * 1. user  create korar time a autometically doct create hobe, and doctor specialty o create hobe so  you must use transaction. 
    * 2. jokhon tmi user create korba, tmr specialty o dite hobe and seita doct er moddeo thakbe. 
 */
export const UserService = {


    //! create doctor
    async createDoctor(payload: ICreateDoctoraPayload) {

        //specialit
        const specialties: Specialty[] = [];
        console.log("payload.specialties", payload.specialties)

        //find the specialities and push into that
        for (const specialtyId of payload.specialties) {
            const specialtyInfo = await prisma.specialty.findUnique({
                where: {
                    id: specialtyId
                }
            })
            if (!specialtyInfo) {
                // throw new Error(`Specialty not found: ${specialtyId}`);

                throw new AppError(status.NOT_FOUND, `Specialty not found: ${specialtyId}`)
            }
            specialties.push(specialtyInfo);
        }

        //user creation
        const userData = await auth.api.signUpEmail({
            body: {
                name: payload.doctor.name,
                email: payload.doctor.email,
                password: payload.password,
                role: Role.DOCTOR,
                needPasswordChange: true,
            }
        });

        try {
            //doctor creation
            const result = await prisma.$transaction(async (tx) => {
                const doctorData = await tx.doctor.create({
                    data: {
                        ...payload.doctor,
                        userId: userData.user.id
                    }
                });

                //map the specialty  and return them with doctor id
                const doctorSpecialtyData = specialties.map((specialty) => {
                    return {
                        doctorId: doctorData.id,
                        specialtyId: specialty.id
                    }
                })
                //create doctorspecialty as well 
                await tx.doctorSpecialty.createMany({
                    data: doctorSpecialtyData
                })

                //after creating how you show doctors, users, this defines
                const doctor = await tx.doctor.findUnique({
                    where: {
                        id: doctorData.id
                    },
                    select: {
                        id: true,
                        userId: true,
                        name: true,
                        email: true,
                        profilePhoto: true,
                        contactNumber: true,
                        address: true,
                        registrationNumber: true,
                        experience: true,
                        designation: true,
                        createdAt: true,
                        updatedAt: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                role: true,
                                status: true,
                                emailVerified: true,
                                image: true,
                                isDeleted: true,
                                deletedAt: true,
                            }
                        },
                        specialties: {
                            select: {
                                specialty: {
                                    select: {
                                        title: true,
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                })
                return doctor
            });


            return {
                result,
            };

        } catch (error) {

            await prisma.user.delete({
                where: { id: userData.user.id }
            });

            throw error;
        }
    },

    //!create Admin
    async createAdmin(payload: ICreateAdmin) {
        //check if email exist or not
        const userExist = await prisma.user.findUnique({
            where: {
                email: payload.admin.email
            }
        })

        //throw err if exists
        if (userExist) {
            throw new AppError(status.CONFLICT, "User with this email already exists");
        }

        console.log("***-- signup enter")
        //now create the user with better auth
        const userData = await auth.api.signUpEmail({
            body: {
                password: payload.password,
                name: payload.admin.name,
                email: payload.admin.email,
                role: Role.ADMIN,
                needPasswordChange: true,
                rememberMe: false,
            }
        })
        console.log("user data", userData)
        console.log("*** -- -signup done")

        //create user profile in transaction
        try {
            const result = await prisma.$transaction(async (tx) => {
                const admin = await tx.admin.create({
                    data: {
                        userId: userData.user.id,
                        name: payload.admin.name,
                        email: payload.admin.email,
                        profilePhoto: payload.admin.profilePhoto,
                        contactNumber: payload.admin.contactNumber,
                    }
                })

                //now fetch the created admin with user data. 
                const fetchedSuperAdmin = await tx.admin.findUnique({
                    where: {
                        id: admin.id,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePhoto: true,
                        contactNumber: true,
                        isDeleted: true,
                        createdAt: true,
                        updateAt: true,
                        deletedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                status: true
                            }
                        }
                    }

                })
                return fetchedSuperAdmin;
            })
            return result;
        } catch (error: any) {
            console.log("ERROR", error)
            //clearnup: Delete user if admin creting fails
            await prisma.user.delete({
                where: {
                    id: userData.user.id
                }
            })
            throw new Error("Failed to create admin")
        }
    },

    //!create Super Admin
    async createSuperAdmin(payload: ICreateSuperAdmin) {

        console.log("---- HItting service")
        //check if email exist or not
        const userExist = await prisma.user.findUnique({
            where: {
                email: payload.superAdmin.email
            }
        })

        //throw err if exists
        if (userExist) {
            throw new AppError(status.CONFLICT, "User with this email already exists");
        }

        console.log("***-- signup enter")
        //now create the user with better auth
        const userData = await auth.api.signUpEmail({
            body: {
                password: payload.password,
                name: payload.superAdmin.name,
                email: payload.superAdmin.email,
                role: Role.SUPER_ADMIN,
                needPasswordChange: true,
                rememberMe: false,
            }
        })
        console.log("user data", userData)
        console.log("*** -- -signup done")

        //create super admin profile in transaction
        try {
            const result = await prisma.$transaction(async (tx) => {
                const SuperAdmin = await tx.superAdmin.create({
                    data: {
                        userId: userData.user.id,
                        name: payload.superAdmin.name,
                        email: payload.superAdmin.email,
                        profilePhoto: payload.superAdmin.profilePhoto,
                        contactNumber: payload.superAdmin.contactNumber,
                    }
                })

                //now fetch the created Super Admin with user data.
                const fetchedSuperAdmin = await tx.superAdmin.findUnique({
                    where: {
                        id: SuperAdmin.id,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePhoto: true,
                        contactNumber: true,
                        isDeleted: true,
                        createdAt: true,
                        updateAt: true,
                        deletedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                status: true
                            }
                        }
                    }

                })
                return fetchedSuperAdmin;
            })
            return result;
        } catch (error: any) {
            console.log("ERROR", error)
            //clearnup: Delete user if super admin creting fails
            await prisma.user.delete({
                where: {
                    id: userData.user.id
                }
            })
            throw new Error("Failed to create super admin")
        }
    }
}

export interface ICreateSuperAdmin {
    password: string,
    superAdmin: {
        name: string,
        email: string,
        profilePhoto?: string,
        contactNumber: string
    }
}