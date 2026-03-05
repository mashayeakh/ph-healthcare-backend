import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

// import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { cloudinaryUpload } from "../../config/cloudinary.config";
import { ScheduleService } from "./schedule.service";
import { Schedule } from '@prisma/prisma/client';
import { IQueryParams } from "@/app/interfaces/query.interface";

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


    // //!get schedules
    getAllSchedules: catchAsyc(
        async (req: Request, res: Response) => {
            const _result = await ScheduleService.getAllSchedules(req.query as IQueryParams);

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Schedule fetched successfully!!",
                result: {
                    data: _result.data,
                    meta: _result.meta
                }
            })
        }
    ),


    // //!get schedule by id
    getScheduleById: catchAsyc(
        async (req: Request, res: Response) => {
            const schedule = await ScheduleService.getScheduleById(req.params.id as string);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Schedule fetched successfully",
                result: schedule
            })

        }
    ),


    // //!update schedule
    updateSchedule: catchAsyc(
        async (req: Request, res: Response) => {
            const payload = req.body;
            const { id } = req.params;
            console.log("schedule to be updated", payload);
            console.log("schedule id found", id);
            res.status(status.OK).json({
                success: true,
                message: "Updated successfully",
                data: await ScheduleService.updateSchedule(id as string, payload)
            })
        }
    )
};
