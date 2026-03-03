import { catchAsyc } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";

import { NextFunction, Request, RequestHandler, Response } from "express";
import status from "http-status";
import { DoctorService } from "./doctor.service";
import { IQueryParams } from "@/app/interfaces/query.interface";



export const DoctorController = {
    viewAllDoctor: catchAsyc(
        async (req: Request, res: Response) => {
            const query = req.query;
            const data = await DoctorService.getAllDoctors(query as IQueryParams)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "All doctor fetched successfully",
                result: data,
                meta: data.meta
                // result: {
                //     // count: data.length,
                //     data: data
                // }
            })
        }
    ),
    viewSingleDoctorById: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await DoctorService.getDoctorById(req.params.id as string)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Specific doctor found successfully",
                result: data

            })
        }
    ),
    //! Soft delete
    softDeleteById: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await DoctorService.softDeleteById(req.params.id as string)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Doctor soft delete established",
                result: data
            })
        }
    ),
    //! update doctor
    updateDoctor: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await DoctorService.updateDoctor(req.params.id as string, req.body)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Doctor updated",
                result: data
            })
        }
    ),
};
