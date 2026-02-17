import { DoctorGender } from "@prisma/prisma/enums";

export interface IUpdateDoctorPayload {
    name?: string;
    email?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber?: string;
    experience?: number;
    gender?: DoctorGender;
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string;
    designation?: string;
    specialties?: string[];
}
