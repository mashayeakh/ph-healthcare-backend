import { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma"
import { SpecialtyType } from "../types/specialty";
import { SpecialtyService } from './specialty.service';


const catchAsyc = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error: any) {
            console.log(error)
            res.status(500).json({
                success: false,
                message: "Failed to fetch ",
                error: error.message
            })
        }
    }

}



export const SpecialtyController = {

    //!create specialty

    specialtyCreate: async (req: Request, res: Response) => {
        const created = await SpecialtyService.createSpecialty(req.body);
        res.status(201).json({
            success: true,
            message: "Specialty created successfully",
            data: created,
        });
    },



    //!get specialty

    // getAllSpecialty: async (req: Request, res: Response) => {
    //     try {
    //         const result = await SpecialtyService.getAllSpecialty()
    //         res.status(201).json({
    //             success: true,
    //             message: "Specialty created successfully",
    //             result: {
    //                 count: result.length,
    //                 data: result
    //             },
    //         });
    //     } catch (error: any) {
    //         console.log(error)
    //         res.status(500).json({
    //             success: false,
    //             message: "Failed to fetch specialty",
    //             error: error.message
    //         })
    //     }
    // },
    getAllSpecialty: catchAsyc(
        async (req: Request, res: Response) => {
            const result = await SpecialtyService.getAllSpecialty()
            res.status(201).json({
                success: true,
                message: "Specialty created successfully!!",
                result: {
                    count: result.length,
                    data: result
                },
            });
        }
    ),


    //!delete specialty

    deleteSpecialty: async (req: Request, res: Response) => {
        try {
            res.status(201).json({
                success: true,
                message: "Specialty deleted successfully",
                data: await SpecialtyService.deleteSepcialty(req.params.id as string),
            });
        } catch (error: any) {
            console.log(error)
            res.status(500).json({
                success: false,
                message: "Failed to delete specialty",
                error: error.message
            })
        }
    }
};
