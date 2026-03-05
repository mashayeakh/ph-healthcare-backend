import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "@/app/interfaces/query.interface";
import { QueryBuilder } from "@/app/utils/queryBuilder";
import { Prisma, Schedule } from "@prisma/prisma/client";
import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { ICreateDoctorSchedulePayload, IUpdateDoctorsSchedulePayload } from "./dto/createDocScheduleDto";


export const DoctorScheduleService = {
    //!create schedule 
    //! since authenticated you must must must provide user's info
    async createMyDoctorSchedule(user: IRequestUser, payload: ICreateDoctorSchedulePayload) {
        const doctorData = await prisma.doctor.findUniqueOrThrow({
            where: {
                email: user.email
            }
        })

        //find doctor schedule data
        const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
            doctorId: doctorData.id,
            scheduleId: scheduleId
        }))

        console.log("Doctor Schedule Data", doctorScheduleData)

        //create doctor schedule data
        const result = await prisma.doctorSchedules.createMany({
            data: doctorScheduleData
        })

        console.log("--- resul ", result)

        return result;

    },

    async updateMyDoctorSchedule(user: IRequestUser, payload: IUpdateDoctorsSchedulePayload) {
        //find the doctor data
        const doctorData = await prisma.doctor.findUniqueOrThrow({
            where: {
                email: user.email
            }
        })

        //delete ids
        const deleteIds = payload.scheduleIds.filter(schedule => schedule.shouldDelete).map(schedule => schedule.id)

        //create ids
        const createIds = payload.scheduleIds.filter(schedule => !schedule.shouldDelete).map(schedule => schedule.id)

        const result = await prisma.$transaction(async (tx) => {
            //delete doctor schedule data
            await tx.doctorSchedules.deleteMany({
                where: {
                    doctorId: doctorData.id,
                    scheduleId: {
                        in: deleteIds
                    }
                }
            })

            //create doctor schedule data
            const doctScheduleData = createIds.map((scheduleId) => ({
                doctorId: doctorData.id,
                scheduleId: scheduleId
            }))
            // create doctor schedule data
            const result = await tx.doctorSchedules.createMany({
                data: doctScheduleData
            })
        })
        return result
    }
}