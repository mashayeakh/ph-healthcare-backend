import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "@/app/interfaces/query.interface";
import { QueryBuilder } from "@/app/utils/queryBuilder";
import { DoctorSchedules, Prisma, Schedule } from "@prisma/prisma/client";
import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { doctorScheduleFilterableFields, doctorScheduleIncludeConfig } from "./appointment.constant";
import { doctorSearchableFields } from "../doctor/doct.constant";
import { IBookAppointmentPayload } from "./dto/createBookAppiontmentDto";
import { uuidv7 } from "zod";


export const AppointmentService = {

    async createBookAppiontment(payload: IBookAppointmentPayload, user: IRequestUser) {

        //patient data 
        const patienData = await prisma.patient.findFirstOrThrow({
            where: {
                email: user.email
            }
        })

        //doct data
        const doctorData = await prisma.doctor.findFirstOrThrow({
            where: {
                id: payload.doctorId,
                isDeleted: false
            }
        })


        //schedule data
        const scheduleData = await prisma.schedule.findFirstOrThrow({
            where: {
                id: payload.scheduleId,
            }
        })


        //doct schedule beir korchi
        const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: scheduleData.id
                }
            }
        })

        //video calling id
        const videoCallingId = String(uuidv7())

        //using transaction to make appointment and payment together
        const result = await prisma.$transaction(async (tx) => {

            //appointment data
            const appointmentData = await tx.appointment.create({
                data: {
                    doctorId: payload.doctorId,
                    patientId: patienData.id,
                    scheduleId: doctorSchedule.scheduleId,
                    videoCallingId: videoCallingId
                }
            })


            //once appoointment is done creating, update the doctor Schedules
            await tx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: payload.doctorId,
                        scheduleId: payload.scheduleId,
                    }
                },
                data: {
                    isBooked: true
                }
            })

            //todo payment integration will be here. 
            return appointmentData;
        })
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
    },

    //get my doctor schedule
    async getMyDoctorSchedule(user: IRequestUser, query: IQueryParams) {
        // find the doctor data
        const doctorData = await prisma.doctor.findUniqueOrThrow({
            where: {
                email: user.email
            }
        })

        // create the query builder
        const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(prisma.doctorSchedules, {
            doctorId: doctorData.id,
            ...query
        },
            {
                filterableFields: doctorScheduleFilterableFields,
                searchableFields: doctorSearchableFields
            }
        )

        const doctorSchedules = await queryBuilder
            .search()
            .filter()
            .paginate()
            .include({
                schedule: true,
            })
            .fields()
            .sort()
            .fields()
            .dynamicInclude(doctorScheduleIncludeConfig)
            .execute()
        return doctorSchedules;


    },
    // get all doctor schedule
    async getAllDoctorSchedule(query: IQueryParams) {



        // create the query builder
        const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(prisma.doctorSchedules, query, {
            filterableFields: doctorScheduleFilterableFields,
            searchableFields: doctorSearchableFields
        },
        )

        const result = await queryBuilder
            .search()
            .filter()
            .paginate()
            .sort()
            .dynamicInclude(doctorScheduleIncludeConfig)
            .execute()
        return result;
    },

    //!get doct schedule by id
    async getDoctorScheduleById(doctorId: string, scheduleId: string) {
        const result = await prisma.doctorSchedules.findUnique({
            where: {
                doctorId_scheduleId: {
                    doctorId,
                    scheduleId
                }
            },
            include: {
                schedule: true,
                doctor: true,
            }
        })
        return result;
    }
}