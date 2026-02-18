import { UserController } from './user.controller';
import z from 'zod';
import { deprecate } from 'node:util';
import { DoctorGender } from '@prisma/prisma/enums';
import express, { NextFunction, Request, RequestHandler, Response } from "express";

const route = express();


//zod validation
//*Schema
const createDoctorZodSchema = z.object({
    // the structure will be simillar the way you send data in postman. 
    password: z.string("Password is required").min(6, "password must be at least 6 characters").max(20, "password must be at most 20 characters"),

    doctor: z.object(
        {
            name: z.string("Name is required")
                .min(5, "Name must be at least 5 characharactersters")
                .max(20, "Name must be at most 20 characharactersters"),

            email: z.email("Invalid email address"),
            registrationNumber: z.string("Registration number is required and it must be unique"),
            address: z.string().optional(),
            experience: z.int("Must be an integer").nonnegative("Experience cannot be negative").optional(),
            gender: z.enum([DoctorGender.FEMALE, DoctorGender.MALE], "Gender must me either MALE or FEMALE"),
            appointmentFee: z.int("Must be an integer").nonnegative("Appointment Fee cannot be negative").optional(),
            qualification: z.string("Qualification is required").min(2, "Qualification must be at least 2 charactoers").max(50, "Qualification must be at most 50 charactoers"),
            currentWorkingPlace: z.string("Current Working Place is required"),
            designation: z.string("Designation must be required")
        }
    ),
    specialties: z.array(z.uuid(), "Specialties must be an array of string").min(1, "At least one specialty is required")
})

//!create doct
route.post(
    "/doc/register",
    (req: Request, res: Response, next: NextFunction) => {
        // console.log("Before zod ", req.body)
        //safe parse
        const parsedResult = createDoctorZodSchema.safeParse(req.body);
        if (!parsedResult.success) {
            //pass the erro to the next
            next(parsedResult.error);
        }
        // console.log("after zod ", req.body)

        //else sanitize the data
        req.body = parsedResult.data
        next();
    },
    UserController.createDoctorUser
);




export const UserRouter = route;