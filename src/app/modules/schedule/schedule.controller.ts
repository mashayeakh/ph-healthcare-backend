import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

// import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { cloudinaryUpload } from "../../config/cloudinary.config";
import { ScheduleService } from "./schedule.service";

export const ScheduleController = {

    //!create Schedule

    scheduleCreate: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("----REEEEED Body ", req.body)

            const created = await ScheduleService.createSchedule(req.body);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Schedule created successfully!!",
                // result:created
            })
        }
    ),


    // //!get specialty
    // getAllSpecialty: catchAsyc(
    //     async (req: Request, res: Response) => {
    //         const _result = await SpecialtyService.getAllSpecialty()

    //         sendResponse(res, {
    //             httpStatusCode: status.OK,
    //             success: true,
    //             message: "Specialty fetched successfully!!",
    //             result: {
    //                 count: _result.length,
    //                 data: _result
    //             }
    //         })
    //     }
    // ),


    // //!delete specialty
    // deleteSpecialty: catchAsyc(
    //     async (req: Request, res: Response) => {
    //         // const result = await SpecialtyService.deleteSepcialty(req.params.id as string)
    //         res.status(status.OK).json({
    //             success: true,
    //             message: "Specialty deleted Succesfully",
    //             data: await SpecialtyService.deleteSepcialty(req.params.id as string)
    //         })

    //     }
    // ),


    // //!edit specialty
    // editSpecialty: catchAsyc(
    //     async (req: Request, res: Response) => {
    //         const payload = req.body;
    //         const { id } = req.params;
    //         console.log("specialty to be edited", payload);
    //         console.log("specialty id found", id);
    //         res.status(status.OK).json({
    //             success: true,
    //             message: "Edited successfully",
    //             data: await SpecialtyService.editSpecialty(id as string, payload)
    //         })
    //     }
    // )
};
