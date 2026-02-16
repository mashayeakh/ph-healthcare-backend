import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { SpecialtyService } from "./specialty.service";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";


export const SpecialtyController = {

    //!create specialty

    specialtyCreate: async (req: Request, res: Response) => {
        const created = await SpecialtyService.createSpecialty(req.body);
        res.status(status.CREATED).json({
            success: true,
            message: "Specialty created successfully",
            data: created,
        });
    },



    //!get specialty
    getAllSpecialty: catchAsyc(
        async (req: Request, res: Response) => {
            const _result = await SpecialtyService.getAllSpecialty()

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Specialty fetched successfully!!",
                result: {
                    count: _result.length,
                    data: _result
                }
            })
        }
    ),


    //!delete specialty
    deleteSpecialty: catchAsyc(
        async (req: Request, res: Response) => {
            // const result = await SpecialtyService.deleteSepcialty(req.params.id as string)
            res.status(status.OK).json({
                success: true,
                message: "Specialty deleted Succesfully",
                data: await SpecialtyService.deleteSepcialty(req.params.id as string)
            })

        }
    ),


    //!edit specialty
    editSpecialty: catchAsyc(
        async (req: Request, res: Response) => {
            const payload = req.body;
            const { id } = req.params;
            console.log("specialty to be edited", payload);
            console.log("specialty id found", id);
            res.status(status.OK).json({
                success: true,
                message: "Edited successfully",
                data: await SpecialtyService.editSpecialty(id as string, payload)
            })
        }
    )
};
