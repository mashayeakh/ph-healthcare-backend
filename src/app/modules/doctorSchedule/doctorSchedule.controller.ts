import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

// import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { cloudinaryUpload } from "../../config/cloudinary.config";
import { Schedule } from '@prisma/prisma/client';
import { IQueryParams } from "@/app/interfaces/query.interface";
import { DoctorScheduleService } from "./doctorSchedule.service";

export const DoctorScheduleController = {

    //!create Schedule

    createMyDoctSchedule: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("----REEEEED Body ", req.body)
            const payload = req.body;
            const user = req.user
            const doctSchedule = await DoctorScheduleService.createMyDoctorSchedule(user, payload);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Doctor Schedule created successfully!!",
                result: doctSchedule
            })
        }
    ),
    //!update Schedule
    updateMyDoctSchedule: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("----REEEEED Body ", req.body)
            const payload = req.body;
            const user = req.user
            const doctSchedule = await DoctorScheduleService.updateMyDoctorSchedule(user, payload);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Doctor Schedule updated successfully!!",
                result: doctSchedule
            })
        }
    ),

    //! get my doc schedule
    getMyDoctSchedule: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("----REEEEED Body ", req.body)
            const user = req.user
            const doctSchedule = await DoctorScheduleService.getMyDoctorSchedule(user, req.params as IQueryParams);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Doctor Schedule retrieved successfully!!",
                result: doctSchedule,
                meta: doctSchedule.meta
            })
        }
    ),

    //! get all doc schedule
    getAllDoctSchedule: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("----REEEEED Body ", req.body)
            const doctSchedule = await DoctorScheduleService.getAllDoctorSchedule(req.params as IQueryParams);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Doctor Schedule retrieved successfully!!",
                result: doctSchedule,
                meta: doctSchedule.meta
            })
        }
    ),
    //! get all doc schedule
    getDoctScheduleById: catchAsyc(
        async (req: Request, res: Response) => {
            const doctorId = req.params.doctorId;
            const scheduleId = req.params.scheduleId;
            const doctSchedule = await DoctorScheduleService.getDoctorScheduleById(doctorId as string, scheduleId as string);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Doctor Schedule retrieved successfully!!",
                result: doctSchedule,
                // meta: doctSchedule.
            })
        }
    ),

};
