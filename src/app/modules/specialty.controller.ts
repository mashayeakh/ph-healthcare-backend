import { Request, Response } from "express";
import { prisma } from "../lib/prisma"
import { SpecialtyType } from "../types/specialty";
import { SpecialtyService } from './specialty.service';



export const SpecialtyController = {
    specialtyCreate: async (req: Request, res: Response) => {

        const created = await SpecialtyService.createSpecialty(req.body);

        res.status(201).json({
            success: true,
            message: "Specialty created successfully",
            data: created,
        });
    },
};
