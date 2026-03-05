import { Prisma } from "@prisma/prisma/client"


export const scheduleFilterableFields = [
    'id',
    'startDateTime',
    'endDateTime',
]

export const scheduleSearchableFields = [
    'id',
    'startDateTime',
    'endDateTime',
]



export const scheduleIncludeConfig: Partial<Record<keyof Prisma.ScheduleInclude, Prisma.ScheduleInclude[keyof Prisma.ScheduleInclude]>> = {


    appointments: {
        include: {
            patient: true,
            doctor: true,
            prescription: true,
            payment: true,
            review: true
        }
    },
    doctorSchedules: true
}



