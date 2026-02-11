import { Specialty } from "../../generated/prisma/client/client";
import { prisma } from "../lib/prisma";
import { SpecialtyType } from "../types/specialty";

export const SpecialtyService = {
    //!create specialty
    async createSpecialty(payload: SpecialtyType) {
        console.log("**payload coming from db", payload);
        return await prisma.specialty.create({ data: payload });
    }
}