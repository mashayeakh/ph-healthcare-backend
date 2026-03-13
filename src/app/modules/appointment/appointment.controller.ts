import { sendResponse } from "@/app/utils/sendResponse";
import { Request, Response } from "express";
import status from "http-status";
import { AppointmentService } from "./appointment.service";
import { catchAsyc } from "@/app/shared/catchAsync";
import { IQueryParams } from "@/app/interfaces/query.interface";


const bookAppointment = catchAsyc(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const appointment = await AppointmentService.createBookAppiontment(payload, user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Appointment booked successfully',
        result: appointment
    }); 1
});


    //!pay mlater

const getMyAppointments = catchAsyc(async (req: Request, res: Response) => {
    const user = req.user;
    const appointments = await AppointmentService.getMyAppiontments(user, req.query as IQueryParams);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Appointments retrieved successfully',
        result: appointments
    });
});

const changeAppointmentStatus = catchAsyc(async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const payload = req.body;
    const user = req.user;

    const updatedAppointment = await AppointmentService.changeAppiontment(appointmentId as string, payload, user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Appointment status updated successfully',
        result: updatedAppointment
    });
});

const getMySingleAppointment = catchAsyc(async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const user = req.user;

    const appointment = await AppointmentService.getMySingleAppiontment(appointmentId as string, user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Appointment retrieved successfully',
        result: appointment
    });
});

const getAllAppointments = catchAsyc(async (req: Request, res: Response) => {
    const appointments = await AppointmentService.getAllAppiontments();
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'All appointments retrieved successfully',
        result: appointments
    });
});

const bookAppointmentWithPayLater = catchAsyc(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const appointment = await AppointmentService.bookAppointmentWithPayLater(payload, user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Appointment booked successfully with Pay Later option',
        result: appointment
    });
});

const initiatePayment = catchAsyc(async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const user = req.user;
    const paymentInfo = await AppointmentService.initiatePayment(appointmentId as string, user);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Payment initiated successfully',
        result: paymentInfo
    });
});

export const AppointmentController = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
    getAllAppointments,
    bookAppointmentWithPayLater,
    initiatePayment,
}