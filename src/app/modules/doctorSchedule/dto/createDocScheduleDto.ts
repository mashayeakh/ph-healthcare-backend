export interface ICreateDoctorSchedulePayload {
    scheduleIds: string[] // Array of schedule IDs to create for the doctor
}

export interface IUpdateDoctorsSchedulePayload {
    scheduleIds: {
        shouldDelete: boolean,
        id: string
    }[]
}