import express, { Application, NextFunction, Request, Response } from 'express';
import { prisma } from './app/lib/prisma';
import { formatInTimeZone } from 'date-fns-tz';
import route from './app/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { envVars } from './app/config/env';
import { globalErrHandler } from './app/middleware/globalHandler';
import { notFound } from './app/middleware/notFound';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import qs from 'qs';
import { PaymentController } from './app/modules/payment/payment.controller';
import cron from "node-cron"
import { AppointmentService } from './app/modules/appointment/appointment.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app: Application = express()

app.set("query parser", (str: string) => qs.parse(str))

// // 
// app.set("view engine", "ejs");
// // app.set("views", path.resolve(process.cwd(), `src/app/templates`));
// // app.set("views", path.join(process.cwd(), "src", "app", "templates"));
// app.set("views", path.join(__dirname, "app", "templates"));\


// // Set view engine and views directory
// console.log('__dirname:', __dirname);

// app.set("view engine", "ejs");
// const viewsPath = path.join(__dirname, "app", "templates");
// console.log('Setting views to:', viewsPath);
// app.set("views", viewsPath);

// // Also check what Express thinks the views directory is
// console.log('Express views directory:', app.get('views'));




// app.use("/api/auth/", toNodeHandler(auth))



// console.log('__dirname:', __dirname);
app.set("view engine", "ejs");
const viewsPath = path.join(__dirname, "app", "templates");
// console.log('Setting views to:', viewsPath);
app.set("views", viewsPath);
// console.log('Express views directory:', app.get('views'));


//? stripe webhook
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)





// THEN add better-auth middleware
// Middleware to parse JSON bodies
app.use(cors({
    // origin: process.env.BETTER_AUTH_URL || `http://localhost:${envVars.PORT}`,
    origin: [
        envVars.FRONTEND_URL,
        envVars.BETTER_AUTH_URL,
        "http://localhost:3000",
        "http://localhost:5000"
    ],
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization",]
})); 
//it calls the cron job every 25 min to cancel unpaid appointments
cron.schedule("*/25 * * * *", async () => {
    try {
        console.log("Running cron job to cancel unpaid appiontments...");
        await AppointmentService.cancelUnpaidAppointments();
    } catch (error: any) {
        console.error("Error occurreed while canceling unpaid appointments :", error.message)
    }
})



app.use("/api/v1/", route);

//global Err
app.use(globalErrHandler);

//not found
app.use(notFound);