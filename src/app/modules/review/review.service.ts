import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { ICreateReviewPayload } from "./review.interface";
import { prisma } from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/prisma/enums";
import { AppError } from "@/app/errorHelpers/AppError";
import status from "http-status";

export const ReivewService = {
    async giveReview(user: IRequestUser, payload: ICreateReviewPayload) {
        const patientData = await prisma.patient.findUnique({
            where: {
                email: user.email
            }
        })


        const appointmentData = await prisma.appointment.findUniqueOrThrow({
            where: {
                id: payload.appointmentId
            }
        })

        if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
            throw new AppError(status.BAD_REQUEST, "You can only review after payment is done")
        }

        if (appointmentData.patientId !== patientData?.id) {
            throw new AppError(status.BAD_REQUEST, "You can only review for your own appointments")
        }

        //is already reviewed or not..
        const isReviewed = await prisma.review.findFirst({
            where: {
                appointmentId: payload.appointmentId
            }
        })

        if (isReviewed) {
            throw new AppError(status.BAD_REQUEST, "You have already reviewed  for this appointment. ")
        }

        //review
        const result = await prisma.$transaction(async (tx) => {
            //create review
            const review = await tx.review.create({
                data: {
                    ...payload,
                    patientId: appointmentData.patientId,
                    doctorId: appointmentData.doctorId,
                }
            })

            //avg rating is in the doct prima. that must be updated.. 
            const avgRating = await tx.review.aggregate({
                where: {
                    doctorId: appointmentData.doctorId
                },
                _avg: {
                    rating: true,
                }
            })

            //now update doct
            await tx.doctor.update({
                where: {
                    id: appointmentData.doctorId
                },
                data: {
                    avgRating: avgRating._avg.rating as number
                }
            })

            return review;
        })

        return result
    }
}