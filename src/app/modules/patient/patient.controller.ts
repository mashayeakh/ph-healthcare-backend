import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { catchAsyc } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";
import { Request, Response } from "express";
import status from "http-status";
import { PatientService } from "./patient.service";


const updateMyProfile = catchAsyc(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user as IRequestUser;

    const output = await PatientService.updateMyProfile(payload, user)

    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Profile update successfully',
        result: output
    });
})


export const PatientCotroller = {
    updateMyProfile
}