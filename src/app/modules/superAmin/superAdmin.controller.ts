import { catchAsyc } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";

import { NextFunction, Request, RequestHandler, Response } from "express";
import status from "http-status";
import { SuperAdminService } from "./superAdmin.service";




export const SuperAdminController = {
    //!get all super-admin
    viewAllSuperAdmin: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await SuperAdminService.getAllSuperAdmins()
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "All super eadmins fetched successfully",
                result: {
                    count: data.length,
                    data: data
                }
            })
        }
    ),

    //!get super-admin by id
    viewSingleSuperAdminById: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await SuperAdminService.getSuperAdminById(req.params.id as string)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Super-Admin found successfully",
                result: data

            })
        }
    ),
    // //! Soft delete
    softDeleteById: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await SuperAdminService.softDeleteById(req.params.id as string)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Super Admin soft delete established",
                result: data
            })
        }
    ),
    // //! update super-admin
    updateSuperAdmin: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await SuperAdminService.updateSuperAdmin(req.params.id as string, req.body)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Super-admin updated",
                result: data
            })
        }
    ),
};
