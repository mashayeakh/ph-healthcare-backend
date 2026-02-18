import { UserStatus } from "@prisma/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { SpecialtyType, UpdateSpecialType } from "../specialty/dto/specialtyDto";
import { Request, Response } from "express";
import { AppError } from "@/app/errorHelpers/AppError";
import status from "http-status";


export const AuthService = {

    //! patient registration 
    async registerPatient(payload: IRegisterPatientPayload, res: Response) {
        const {
            name,
            email,
            password
        } = payload;

        //using better auth signupEmail api to create
        const data = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password
            }
        });

        if (!data.user) {
            // throw new Error("Failed to register patient");
            throw new AppError(status.BAD_REQUEST, "Failed to register patient")
        }

        //since by default user is patient, we want once he is registered, his profile will be created automatically, without that, the profile wont be created. 

        try {
            const patient = await prisma.$transaction(async (tx) => {
                //create the patient
                return await tx.patient.create({
                    //what to put in the profile, we will define here
                    data: {
                        userId: data.user.id,
                        name: payload.name,
                        email: payload.email,
                    }
                })
            })

            return {
                ...data,
                patient
            };
        } catch (error) {
            console.log("Transaction error ", error);
            //if patient is registered but profile is not created then we can delete the patient manually
            await prisma.user.delete({
                where: {
                    id: data.user.id
                }
            })
            throw error;

        }
    },




    async loginPatient(payload: ILoginUserPayload) {

        const { email, password } = payload

        //better auth sign in
        const data = await auth.api.signInEmail({
            body: {
                email,
                password
            }
        })

        //verification
        if (data.user.status === UserStatus.BLOCKED) {
            // throw new Error("User is blocked");
            throw new AppError(status.FORBIDDEN, "User is blocked")
        }

        //you can do some other verification as well. 
        return data;
    }

}