import { prisma } from "@/app/lib/prisma"
import { IUpdateDoctorPayload } from "./dto/updateDoctor.dto"

export const DoctorService = {
    //!get all doctors
    async getAllDoctors() {
        return await prisma.doctor.findMany({
            include: {
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                }
            }
        })
    },

    //!get doctor by id 
    async getDoctorById(id: string) {
        return await prisma.doctor.findUnique({
            where: {
                id: id
            }
        })
    },

    //! soft delete means you must use update() the isDeleated and set the deleatedAt time because you cant use delete()
    async softDeleteById(id: string) {
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
        const { specialties, ...doctorData } = payload;

        return await prisma.doctor.update({
            where: {
                id: id
            }, data: doctorData
        })
    }

}