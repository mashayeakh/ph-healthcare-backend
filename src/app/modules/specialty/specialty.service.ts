import { prisma } from "../../lib/prisma";
import { SpecialtyType, UpdateSpecialType } from "./dto/specialtyDto";


export const SpecialtyService = {
    //!create specialty
    async createSpecialty(payload: SpecialtyType) {
        console.log("**payload coming from db", payload);
        return await prisma.specialty.create({ data: payload });
    },

    //! view all specialty
    async getAllSpecialty() {
        return await prisma.specialty.findMany()
    },

    //! delete specific specialty
    async deleteSepcialty(id: string) {
        return await prisma.specialty.delete({
            where: {
                id: id
            }
        });
    },

    //! edit specific specialty
    async editSpecialty(id: string, payload: UpdateSpecialType) {
        return await prisma.specialty.update({
            where: {
                id: id
            }, data: payload
        })
    }
}