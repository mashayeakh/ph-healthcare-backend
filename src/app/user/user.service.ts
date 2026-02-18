import { Role } from "@prisma/prisma/enums";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { ICreateDoctoraPayload } from "./dto/doctorDto";
import { Specialty } from "@prisma/prisma/client";
import { AppError } from "../errorHelpers/AppError";
import status from "http-status";


/*
    * 1. user  create korar time a autometically doct create hobe, and doctor specialty o create hobe so  you must use transaction. 
    * 2. jokhon tmi user create korba, tmr specialty o dite hobe and seita doct er moddeo thakbe. 
 */
export const UserService = {


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
    }


}