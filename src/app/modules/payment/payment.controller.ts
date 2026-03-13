import { envVars } from "@/app/config/env";
import { catchAsyc } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/utils/sendResponse";
import { Response, Request } from 'express';
import status from "http-status";
import { PaymentService } from "./payment.service";
import { stripe } from "@/app/config/stripe.config";

export const PaymentController = {
    //handling strip webhook event
    handleStripeWebhookEvent: catchAsyc(
        async (req: Request, res: Response) => {

            //get the stripe signature
            const signature = req.headers['stripe-signature'] as string;

            //get the webhook secrect from the env
            const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;


            //checking availability
            if (!signature || !webhookSecret) {
                console.error("Missing stripe signature or webhook secret")
                return res.status(status.BAD_REQUEST).json({
                    message: "Missing strip signature or webhook secret "
                })
            }

            //now construct the webhook 
            let event;
            try {
                const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
            } catch (error) {
                console.error("Error processing stripe webhook", error);
                return res.status(status.BAD_REQUEST).json({
                    message: "Enter processing Stripe webhook"
                })
            }

            try {
                const data = await PaymentService.handleStripeWebhookEvent(event!);

                sendResponse(res, {
                    httpStatusCode: status.OK,
                    success: true,
                    message: "Strip webhook event processed successfully",
                    result: data
                })
            } catch (error) {
                console.error("Error processing stripe webhook", error);
                sendResponse(res, {
                    httpStatusCode: status.INTERNAL_SERVER_ERROR,
                    success: false,
                    message: "Error handling stripe webhook event"
                })
            }
        }
    )
}