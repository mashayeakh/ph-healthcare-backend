import { prisma } from "@/app/lib/prisma"
import { PaymentStatus } from "@prisma/prisma/enums"
import Stripe from "stripe"

export const PaymentService = {
    // handle stripe web hook. 
    async handleStripeWebhookEvent(event: Stripe.Event) {

        //checking existing payment
        const existingPayment = await prisma.payment.findFirst({
            where: {
                stripeEventId: event.id
            }
        })

        //check its availability
        if (existingPayment) {
            console.error(`Event ${event.id} already processed. Skipping`)
            return {
                message: `Event ${event.id} already prcessed. Skipping`
            }
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object

                const appointmentId = session.metadata?.appointmentId

                const paymentId = session.metadata?.paymentId

                if (!appointmentId || !paymentId) {
                    console.error("Missing appointmentId or paymentId in session metadata");
                    return {
                        message: "Missing appointmentId or paymentId in session metadata"
                    }
                }

                //get the appiontment
                const appiontment = await prisma.appointment.findUnique({
                    where: {
                        id: appointmentId
                    }
                })

                if (!appiontment) {
                    console.error(`Appiontment with id ${appointmentId} not found`);
                    return {
                        message: `Appointment with id ${appointmentId} not found`
                    }
                }

                //use transaction to update the payment status
                await prisma.$transaction(async (tx) => {
                    await tx.appointment.update({
                        where: {
                            id: appointmentId
                        },
                        data: {
                            paymentStatus: session.payment_status === "paid" ?
                                PaymentStatus.PAID : PaymentStatus.UNPAID
                        }
                    })

                    //update the payment as well
                    await tx.payment.update({
                        where: {
                            id: paymentId
                        },
                        data: {
                            stripeEventId: event.id,
                            status: session.payment_status === "paid" ?
                                PaymentStatus.PAID : PaymentStatus.UNPAID,
                            paymentGatewayData: session as any
                        }
                    });
                })
                console.log(`proceessed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`)
                break;
            }
            case "checkout.session.expired": {
                const session = event.data.object;
                console.log(`Checkout session ${session.id} expired. Marking associated payment as failed`)
                break;
            }
            case "payment_intent.payment_failed": {
                const session = event.data.object;
                console.log(`Payment intent ${session.id} failed. Marking associated payment as failed`)
            }
            default:
                console.log(`Unghandled event type ${event.type}`)
        }

        return {
            message: `Webhook Event ${event.id} processed successfully. `
        }

    }
}


