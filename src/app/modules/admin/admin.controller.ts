import { catchAsyc } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";

import { NextFunction, Request, RequestHandler, Response } from "express";
import status from "http-status";
import { AdminService } from "./admin.service";



export const AdminController = {
    //!get all admins
    viewAllAdmin: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await AdminService.getAllAdmins()
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "All admins fetched successfully",
                result: {
                    count: data.length,
                    data: data
                }
            })
        }
    ),

    //!get admin by id
    viewSingleAdminById: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await AdminService.getAdminById(req.params.id as string)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Admin found successfully",
                result: data

            })
        }
    ),
    // //! Soft delete
    softDeleteById: catchAsyc(
        async (req: Request, res: Response) => {
            const user = req.user;
            console.log("logged in user ", user)
            const data = await AdminService.softDeleteAdminById(req.params.id as string, user)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Admin soft delete established",
                result: data
            })
        }
    ),
    // //! update admin
    updateAdmin: catchAsyc(
        async (req: Request, res: Response) => {
            const data = await AdminService.updateAdmin(req.params.id as string, req.body)
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Admin updated",
                result: data
            })
        }
    ),
};
