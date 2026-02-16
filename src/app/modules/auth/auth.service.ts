import { UserStatus } from "@prisma/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { SpecialtyType, UpdateSpecialType } from "../specialty/dto/specialtyDto";
import { Request, Response } from "express";


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
            throw new Error("Failed to register patient");
        }

        //since by default user is patient, we want once he is registered, his profile will be created automatically, without that, the profile wont be created. 
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
            throw new Error("User is blocked");
        }

        //you can do some other verification as well. 
        return data;
    }

}