import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "@/app/interfaces/query.interface";
import { QueryBuilder } from "@/app/utils/queryBuilder";
import { AppointmentStatus, DoctorSchedules, PaymentStatus, Prisma, Role, Schedule } from "@prisma/prisma/client";
import { IRequestUser } from "@/app/interfaces/requestUserInterface";
import { doctorScheduleFilterableFields, doctorScheduleIncludeConfig } from "./appointment.constant";
import { doctorSearchableFields } from "../doctor/doct.constant";
import { IBookAppointmentPayload } from "./dto/createBookAppiontmentDto";
import { IUpdateDoctorsSchedulePayload } from "../doctorSchedule/dto/createDocScheduleDto";
import { v7 as uuidv7 } from "uuid";
import status from "http-status";
import { AppError } from "@/app/errorHelpers/AppError";
import { stripe } from './../../config/stripe.config';
import { envVars } from "@/app/config/env";
// import { uuidv7 } from 'zod';


export const AppointmentService = {

    //pay now booking appointment with stripe

    async createBookAppiontment(payload: IBookAppointmentPayload, user: IRequestUser) {

        //patient data 
        const patientData = await prisma.patient.findUniqueOrThrow({
            where: {
                email: user.email,
            }
        });

        const doctorData = await prisma.doctor.findUniqueOrThrow({
            where: {
                id: payload.doctorId,
                isDeleted: false,
            }
        });

        const scheduleData = await prisma.schedule.findUniqueOrThrow({
            where: {
                id: payload.scheduleId,
            }
        });

        const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: scheduleData.id,
                }
            }
        });

        const videoCallingId = String(uuidv7());

        const result = await prisma.$transaction(async (tx) => {
            const appointmentData = await tx.appointment.create({
                data: {
                    doctorId: payload.doctorId,
                    patientId: patientData.id,
                    scheduleId: doctorSchedule.scheduleId,
                    videoCallingId,
                }
            });

            await tx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: payload.doctorId,
                        scheduleId: payload.scheduleId,
                    }
                },
                data: {
                    isBooked: true,
                }
            });

            //TODO : Payment Integration will be here

            const transactionId = String(uuidv7());

            const paymentData = await tx.payment.create({
                data: {
                    appointmentId: appointmentData.id,
                    amount: doctorData.appointmentFee,
                    transactionId
                }
            });

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: "bdt",
                            product_data: {
                                name: `Appointment with Dr. ${doctorData.name}`,
                            },
                            unit_amount: doctorData.appointmentFee * 100,
                        },
                        quantity: 1,
                    }
                ],
                metadata: {
                    appointmentId: appointmentData.id,
                    paymentId: paymentData.id,
                },

                // success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment.id}}`,

                success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${paymentData.id}`,

                // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
                cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`,
            })

            return {
                appointmentData,
                paymentData,
                paymentUrl: session.url,
            };
        });

        return {
            appointment: result.appointmentData,
            payment: result.paymentData,
            paymentUrl: result.paymentUrl,
        };
    },



    //pay later booking appointment
    async bookAppointmentWithPayLater(payload: IBookAppointmentPayload, user: IRequestUser) {
        //patient data 
        const patienData = await prisma.patient.findFirstOrThrow({
            where: {
                email: user.email
            }
        })

        //doct data
        const doctorData = await prisma.doctor.findFirstOrThrow({
            where: {
                id: payload.doctorId,
                isDeleted: false
            }
        })


        //schedule data
        const scheduleData = await prisma.schedule.findFirstOrThrow({
            where: {
                id: payload.scheduleId,
            }
        })


        //doct schedule beir korchi
        const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: scheduleData.id
                }
            }
        })

        //video calling id
        const videoCallingId = String(uuidv7())

        //using transaction to make appointment and payment together
        const result = await prisma.$transaction(async (tx) => {

            //appointment data
            const appointmentData = await tx.appointment.create({
                data: {
                    doctorId: payload.doctorId,
                    patientId: patienData.id,
                    scheduleId: doctorSchedule.scheduleId,
                    videoCallingId: videoCallingId
                }
            })


            //once appoointment is done creating, update the doctor Schedules
            await tx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: payload.doctorId,
                        scheduleId: payload.scheduleId,
                    }
                },
                data: {
                    isBooked: true
                }
            })

            //stripe id wont be created but payment will be created
            const transactionId = String(uuidv7());

            const paymentData = await tx.payment.create({
                data: {
                    appointmentId: appointmentData.id,
                    amount: doctorData.appointmentFee,
                    transactionId
                }
            })


            return {
                appiontment: appointmentData,
                payment: paymentData
            };
        })

        return result;
    },


    async initiatePayment(appointmentId: string, user: IRequestUser) {
        //patient data
        const patientData = await prisma.patient.findUniqueOrThrow({
            where: {
                email: user.email
            }
        })

        //appiontmentData 
        const appiontmentData = await prisma.appointment.findFirstOrThrow({
            where: {
                id: appointmentId,
                patientId: patientData.id
            },
            include: {
                doctor: true,
                payment: true,
            }
        })


        // check if payme exist or not
        if (!appiontmentData.payment) {
            throw new AppError(status.BAD_REQUEST, "Payment data not found for this appointment")
        }


        // check if payment is already done
        if (appiontmentData.payment?.status === PaymentStatus.PAID) {
            throw new AppError(status.BAD_REQUEST, "Payment is already completed for this appointment")
        }

        // check if cancel
        if (appiontmentData.status === AppointmentStatus.CANCELED) {
            throw new AppError(status.BAD_REQUEST, "Appiont is canceled. ")
        }


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Appointment with Dr. ${appiontmentData.doctor.name}`,
                        },
                        unit_amount: appiontmentData.doctor.appointmentFee * 100,
                    },
                    quantity: 1,
                }
            ],

            metadata: {
                appointmentId: appiontmentData.id,
                paymentId: appiontmentData.payment?.id,
            },
            success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,

            // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`

            cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`
        })

        return {
            paymentUrl: session.url
        }

    },






    async updateMyDoctorSchedule(user: IRequestUser, payload: IUpdateDoctorsSchedulePayload) {
        //find the doctor data
        const doctorData = await prisma.doctor.findUniqueOrThrow({
            where: {
                email: user.email
            }
        })

        //delete ids
        const deleteIds = payload.scheduleIds.filter(schedule => schedule.shouldDelete).map(schedule => schedule.id)

        //create ids
        const createIds = payload.scheduleIds.filter(schedule => !schedule.shouldDelete).map(schedule => schedule.id)

        const result = await prisma.$transaction(async (tx) => {
            //delete doctor schedule data
            await tx.doctorSchedules.deleteMany({
                where: {
                    doctorId: doctorData.id,
                    scheduleId: {
                        in: deleteIds
                    }
                }
            })

            //create doctor schedule data
            const doctScheduleData = createIds.map((scheduleId) => ({
                doctorId: doctorData.id,
                scheduleId: scheduleId
            }))
            // create doctor schedule data
            const result = await tx.doctorSchedules.createMany({
                data: doctScheduleData
            })
        })
        return result
    },

    //!get my doctor schedule
    async getMyAppiontments(user: IRequestUser, query: IQueryParams) {

        // find the patient data
        const patientData = await prisma.patient.findUnique({
            where: {
                email: user?.email
            }
        })


        // find the doctor data
        const doctorData = await prisma.doctor.findUnique({
            where: {
                email: user?.email
            }
        })


        let appointments = [];

        if (patientData) {
            // appointnment and push in appiontmnts
            appointments = await prisma.appointment.findMany({
                where: {
                    patientId: patientData.id
                },
                include: {
                    doctor: true,
                    schedule: true,
                }
            })
        } else if (doctorData) {
            // appointnment and push in appiontmnts
            appointments = await prisma.appointment.findMany({
                where: {
                    doctorId: doctorData.id
                },
                include: {
                    patient: true,
                    schedule: true,
                }
            })
        } else {
            throw new Error("User not found");
        }
    },


    //! change appiontment Status
    async changeAppiontment(
        appiontmentId: string,
        appiontmentStatus: AppointmentStatus,
        user: IRequestUser
    ) {
        //find the appiontment
        const appiontmentData = await prisma.appointment.findUniqueOrThrow({
            where: {
                id: appiontmentId,
            },
            include: {
                doctor: true,
            }
        })

        if (user?.role === Role.DOCTOR) {
            if (!(user?.email === appiontmentData.doctor.email))
                throw new AppError(status.BAD_REQUEST, "This is not your appointment")
        }

        return await prisma.appointment.update({
            where: {
                id: appiontmentId
            },
            data: {
                status: appiontmentStatus
            }
        })
    },

    //!get my single appiontment
    async getMySingleAppiontment(appointmentId: string, user: IRequestUser) {
        const patientData = await prisma.patient.findUnique({
            where: {
                email: user?.email
            }
        });

        const doctorData = await prisma.doctor.findUnique({
            where: {
                email: user?.email
            }
        });

        let appointment;

        if (patientData) {
            appointment = await prisma.appointment.findFirst({
                where: {
                    id: appointmentId,
                    patientId: patientData.id
                },
                include: {
                    doctor: true,
                    schedule: true
                }
            });
        } else if (doctorData) {
            appointment = await prisma.appointment.findFirst({
                where: {
                    id: appointmentId,
                    doctorId: doctorData.id
                },
                include: {
                    patient: true,
                    schedule: true
                }
            });
        }

        if (!appointment) {
            throw new AppError(status.NOT_FOUND, "Appointment not found");
        }

        return appointment;
    },

    //!get all Appiontments
    async getAllAppiontments() {
        const appointments = await prisma.appointment.findMany({
            include: {
                doctor: true,
                patient: true,
                schedule: true
            }
        });
        return appointments;
    },


    //! get all doctor schedule
    async getAllDoctorSchedule(query: IQueryParams) {



        // create the query builder
        const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(prisma.doctorSchedules, query, {
            filterableFields: doctorScheduleFilterableFields,
            searchableFields: doctorSearchableFields
        },
        )

        const result = await queryBuilder
            .search()
            .filter()
            .paginate()
            .sort()
            .dynamicInclude(doctorScheduleIncludeConfig)
            .execute()
        return result;
    },

    //!get doct schedule by id
    async getDoctorScheduleById(doctorId: string, scheduleId: string) {
        const result = await prisma.doctorSchedules.findUnique({
            where: {
                doctorId_scheduleId: {
                    doctorId,
                    scheduleId
                }
            },
            include: {
                schedule: true,
                doctor: true,
            }
        })
        return result;
    },

    //! cancle uppaid appiointment
    async cancelUnpaidAppointments() {
        // find all appiontment which are unpaid and created 30 minutes ago

        const thirtyMinutesAge = new Date(Date.now() - 30 * 60 * 1000);

        // find all the unpaid appiontments which are craeted less than 30 mins ago
        const unpaidAppointmentsThatAreOver30MinutesOld = await prisma.appointment.findMany({
            where: {
                status: AppointmentStatus.SCHEDULED,
                createdAt: {
                    lte: thirtyMinutesAge
                },
                paymentStatus: PaymentStatus.UNPAID
            }
        })

        // cancel all the appiontments
        const appointmentToCancelIds = unpaidAppointmentsThatAreOver30MinutesOld.map((appointment => appointment.id));

        console.log("appointment to cancel", appointmentToCancelIds);

        //run a tarnsation to update the appointment status "Cancel"

        await prisma.$transaction(async (tx) => {
            await tx.appointment.updateMany({
                where: {
                    id: {
                        in: appointmentToCancelIds,
                    },
                },
                data: {
                    status: AppointmentStatus.CANCELED
                }
            })

            //delete the payment data
            await tx.payment.deleteMany({
                where: {
                    appointmentId: { in: appointmentToCancelIds }
                }
            })

            // now if the appiontment is canceled then the doctor schedule should be available again. so we need to update the doctor schedule data using loop
            for (const unpaidAppointment of unpaidAppointmentsThatAreOver30MinutesOld) {
                // Update the doctor schedule data
                await tx.doctorSchedules.update({
                    where: {
                        doctorId_scheduleId: {
                            doctorId: unpaidAppointment.doctorId,
                            scheduleId: unpaidAppointment.scheduleId
                        },
                    },
                    data: {
                        isBooked: false,
                    }
                })
            }
        })

    }
}