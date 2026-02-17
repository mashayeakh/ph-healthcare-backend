import { Request, Response } from "express";
import status from "http-status";
import { catchAsyc } from "../shared/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { UserService } from "./user.service";



export const UserController = {

    createDoctorUser: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("** \nhit in controller");
            console.log(req.body)
            // const payload = req.body;
            // console.log("Controller payload = ", payload)

            const data = await UserService.createDoctor(req.body);

            console.log("controller Data = ", data)

            sendResponse(res, {
                httpStatusCode: status.CREATED,
                success: true,
                message: "created",
                result: data
            })
        }
    )


};
