import { DoctorGender } from "@prisma/prisma/enums";

export interface IUpdateAdminPayload {
    name?: string;
    email?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
}
