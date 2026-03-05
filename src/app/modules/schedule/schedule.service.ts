import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { ICreateSchedulePayload, IUpdateSchedulePayload } from "./dto/scheduleDto";
import { convertDateTime } from "./schedule.utils";
import { IQueryParams } from "@/app/interfaces/query.interface";
import { QueryBuilder } from "@/app/utils/queryBuilder";
import { Prisma, Schedule } from "@prisma/prisma/client";
import { scheduleFilterableFields, scheduleIncludeConfig, scheduleSearchableFields } from "./schedule.constant";


export const ScheduleService = {
    //!create schedule
    async createSchedule(payload: ICreateSchedulePayload) {
        const {
            startDate,
            endDate,
            startTime,
            endTime,
        } = payload;

        //30 mins interval 
        const interval = 30;

        const currDate = new Date(startDate);
        const lastDate = new Date(endDate);

        const schedules = [];

        while (currDate <= lastDate) {
            const startDateTime = new Date(
                addMinutes(
                    addHours(
                        `${format(
                            currDate, "yyyy-MM-dd"
                        )}`,
                        Number(startTime.split(":")[0])//converting string to number
                    ),
                    Number(startTime.split(":")[1])//converting string to number
                )
            );
            const endDateTime = new Date(
                addMinutes(
                    addHours(
                        `${format(
                            currDate, "yyyy-MM-dd"
                        )}`,
                        Number(endTime.split(":")[0])//converting string to number
                    ),
                    Number(endTime.split(":")[1])//converting string to number
                )
            );

            // session create in interval of 30 mins
            while (startDateTime < endDateTime) {
                const s = await convertDateTime(startDateTime);
                const e = await convertDateTime(addMinutes(startDateTime, interval));

                //schedule data
                const scheduleData = {
                    startDateTime: s,
                    endDateTime: e,
                }

                //checking if schedule already exists
                const existingSchedule = await prisma.schedule.findFirst({
                    where: {
                        startDateTime: scheduleData.startDateTime,
                        endDateTime: scheduleData.endDateTime,
                    }
                });

                if (!existingSchedule) {
                    //createing schedule if not exists
                    const result = await prisma.schedule.create({
                        data: scheduleData
                    })

                    schedules.push(result);
                }

                //incrementing startDateTime by 30 mins
                startDateTime.setMinutes(startDateTime.getMinutes() + interval)

            }

            currDate.setDate(currDate.getDate() + 1);
        }

        return schedules


    },

    //! view all schedules
    async getAllSchedules(query: IQueryParams) {

        //* using query builder
        const queryBuilder = new QueryBuilder<
            Schedule,
            Prisma.ScheduleWhereInput,
            Prisma.ScheduleInclude
        >(
            prisma.schedule,
            query,
            {
                searchableFields: scheduleSearchableFields,
                filterableFields: scheduleFilterableFields
            }
        )

        const result = await queryBuilder
            .search()
            .filter()
            .paginate()
            .dynamicInclude(scheduleIncludeConfig)
            .sort()
            .fields()
            .execute()

        return result
    },

    //! get specific schedule by id
    async getScheduleById(id: string) {
        return await prisma.schedule.findUnique({
            where: {
                id: id
            }
        })
    },

    //! update specific schedule
    async updateSchedule(id: string, payload: IUpdateSchedulePayload) {
        const {
            startDate,
            endDate,
            startTime,
            endTime,
        } = payload;

        //30 mins interval 
        const interval = 30;

        const currDate = new Date(startDate);
        const lastDate = new Date(endDate);

        const schedules = [];

        while (currDate <= lastDate) {
            const startDateTime = new Date(
                addMinutes(
                    addHours(
                        `${format(
                            currDate, "yyyy-MM-dd"
                        )}`,
                        Number(startTime.split(":")[0])//converting string to number
                    ),
                    Number(startTime.split(":")[1])//converting string to number
                )
            );
            const endDateTime = new Date(
                addMinutes(
                    addHours(
                        `${format(
                            currDate, "yyyy-MM-dd"
                        )}`,
                        Number(endTime.split(":")[0])//converting string to number
                    ),
                    Number(endTime.split(":")[1])//converting string to number
                )
            );

            // session create in interval of 30 mins
            while (startDateTime < endDateTime) {
                const s = await convertDateTime(startDateTime);
                const e = await convertDateTime(addMinutes(startDateTime, interval));

                //schedule data
                const scheduleData = {
                    startDateTime: s,
                    endDateTime: e,
                }

                //checking if schedule already exists
                const existingSchedule = await prisma.schedule.findFirst({
                    where: {
                        startDateTime: scheduleData.startDateTime,
                        endDateTime: scheduleData.endDateTime,
                    }
                });

                if (!existingSchedule) {
                    //updating schedule if not exists
                    const update = await prisma.schedule.update({
                        where: {
                            id: id
                        },
                        data: {
                            startDateTime: scheduleData.startDateTime,
                            endDateTime: scheduleData.endDateTime,
                        }
                    })

                    schedules.push(update);
                }

                //incrementing startDateTime by 30 mins
                startDateTime.setMinutes(startDateTime.getMinutes() + interval)

            }

            currDate.setDate(currDate.getDate() + 1);
        }

        return schedules

    }
}