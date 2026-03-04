import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { ICreateSchedulePayload } from "./dto/scheduleDto";
import { convertDateTime } from "./schedule.utils";


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
    async getAllSchedules() {
    },

    //! delete specific schedule
    async deleteSchedule(id: string) {

    },

    //! edit specific schedule
    async editSchedule() {

    }
}