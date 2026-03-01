import { Prisma } from "@prisma/prisma/client"
import { includes } from "zod"

export const doctorSearchableFields = [
    'name', 'email', 'specialties', 'specialty.title', 'registrationNumber', 'qualification', 'currentWorkingPlace', 'designation'
]

export const doctorFilterableFields = [
    'gender', 'isDeleted', 'appointmentFee', 'experience', 'registrationNumber', 'specialties.specialtyId', 'specialties.specialty', 'qualification', 'currentWorkingPlace', 'designation', 'title', 'user.role'

]


export const doctorIncludeConfig: Partial<Record<keyof Prisma.DoctorInclude, Prisma.DoctorInclude[keyof Prisma.DoctorInclude]>> = {
    user: true,
    specialties: {
        include: {
            specialty: true,
        }
    },

    appointments: {
        include: {
            patient: true,
            doctor: true,
            prescription: true,
        }
    },

    doctorSchedules: {
        include: {
            schedule: true,
        }
    },

    prescriptions: true,
    reviews: true
}



