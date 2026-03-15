import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "@/app/interfaces/query.interface";
import { QueryBuilder } from "@/app/utils/queryBuilder";
import { DoctorSchedules, Prisma, Schedule } from "@prisma/prisma/client";
import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { ICreateDoctorSchedulePayload, IUpdateDoctorsSchedulePayload } from "./dto/createDocScheduleDto";
import { doctorScheduleFilterableFields, doctorScheduleIncludeConfig } from "./doctorSchedule.constant";
import { doctorSearchableFields } from "../doctor/doct.constant";


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
        await prisma.doctorSchedules.createMany({
            data: doctorScheduleData
        })

        const result = await prisma.doctorSchedules.findMany({
            where: {
                doctorId: doctorData.id,
                scheduleId: {
                    in: payload.scheduleIds
                }
            },
            include: {
                schedule: true
            }
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
                    isBooked: false,
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