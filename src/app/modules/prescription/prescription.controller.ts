import { sendResponse } from "@/app/utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReivewService } from "./prescription.service";
import { catchAsyc } from "@/app/shared/catchAsync";


const giveReview = catchAsyc(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await ReivewService.giveReview(user, payload);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'Review created successfully',
        result: result,
    });
});

const getAllReviews = catchAsyc(async (req: Request, res: Response) => {

    const result = await ReivewService.getAllReviews();
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieval successfully',
        result: result
    });
});

const myReviews = catchAsyc(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await ReivewService.myReviews(user);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieval successfully',
        result: result
    });

});

const updateReview = catchAsyc(async (req: Request, res: Response) => {
    const user = req.user;
    const reviewId = req.params.id;
    const payload = req.body;

    const result = await ReivewService.updateReivew(user, reviewId as string, payload);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'Review updated successfully',
        result: result
    });
}
);

const deleteReview = catchAsyc(async (req: Request, res: Response) => {
    const user = req.user;
    const reviewId = req.params.id;
    const result = await ReivewService.deleteReview(user, reviewId as string);
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'Review deleted successfully',
        result: result
    });
});


export const ReviewController = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview
}