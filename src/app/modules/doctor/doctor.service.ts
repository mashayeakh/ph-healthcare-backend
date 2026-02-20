import { prisma } from "@/app/lib/prisma"
import { IUpdateDoctorPayload } from "./dto/updateDoctor.dto"
import { AppError } from "@/app/errorHelpers/AppError"
import status from "http-status"

export const DoctorService = {
    //!get all doctors
    async getAllDoctors() {
        const result = await prisma.doctor.findMany({
            where: {
                isDeleted: false,
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                contactNumber: true,
                registrationNumber: true,
                experience: true,
                gender: true,
                appointmentFee: true,
                qualification: true,
                currentWorkingPlace: true,
                designation: true,
                avgRating: true,
                createdAt: true,
                updatedAt: true,
                specialties: {
                    select: {
                        specialty: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            }
        })
        return result.map((doctor) => ({
            ...doctor,
            specialties: doctor.specialties.map((s) => s.specialty)
        }))
    },

    //!get doctor by id 
    async getDoctorById(id: string) {
        const doctor = await prisma.doctor.findUnique({
            where: {
                id: id
            },
            include: {
                specialties: {
                    include: {
                        specialty: true,
                    },
                },
            },
        })
        if (!doctor) {
            throw new AppError(status.NOT_FOUND, "Doctor not found")
        }

        // Transform specialties to flatten structure
        return {
            ...doctor,
            specialties: doctor.specialties.map((s) => s.specialty),
        };
    },

    //! soft delete means you must use update() the isDeleated and set the deleatedAt time because you cant use delete()
    async softDeleteById(id: string) {


        // Check if doctor exists and not already deleted
        const doctor = await prisma.doctor.findUnique({
            where: { id },
        });



        if (!doctor) {
            throw new AppError(status.NOT_FOUND, "Doctor not found")
        }

        if (doctor.isDeleted) {
            throw new AppError(status.NO_CONTENT, "Already deleted")
        }



        return await prisma.doctor.update({
            where: {
                id: id
            },
            data: {
                isDeleted: true,
                deleteAt: new Date()
            }
        })
    },

    //!update any doctor. 
    async updateDoctor(id: string, payload: IUpdateDoctorPayload) {
        // Check if doctor exists and not deleted
        const existingDoctor = await prisma.doctor.findUnique({
            where: { id, isDeleted: false },
        });

        if (!existingDoctor) {
            throw new Error("Doctor not found");
        }

        // Separate specialties from doctor data
        const { specialties, ...doctorData } = payload;

        // Update doctor basic information
        const updatedDoctor = await prisma.doctor.update({
            where: { id },
            data: doctorData,
            include: {
                specialties: {
                    include: {
                        specialty: true,
                    },
                },
            },
        });

        // If specialties are provided, update them separately
        if (specialties && specialties.length > 0) {
            // Delete old specialties
            await prisma.doctorSpecialty.deleteMany({
                where: { doctorId: id },
            });

            // Add new specialties
            const specialtiesData = specialties.map((specialtyId) => ({
                doctorId: id,
                specialtyId,
            }));

            await prisma.doctorSpecialty.createMany({
                data: specialtiesData,
            });

            // Fetch updated doctor with new specialties
            const result = await prisma.doctor.findUnique({
                where: { id },
                include: {
                    specialties: {
                        include: {
                            specialty: true,
                        },
                    },
                },
            });

            return {
                ...result,
                specialties: result?.specialties.map((s) => s.specialty) || [],
            };
        }

        // Return updated doctor with transformed specialties
        return {
            ...updatedDoctor,
            specialties: updatedDoctor.specialties.map((s) => s.specialty),
        };
    }



}