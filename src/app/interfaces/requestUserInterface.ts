import { Role } from "@prisma/prisma/enums";

export interface IRequestUser {
    userId: string,
    email: string,
    role: Role
}