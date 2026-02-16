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
        console.log("***DATA ", data)

        //TODO - we will create profile of patient once we finish with patient prisma
        return data;
    },


    async loginPatient(payload: ILoginUserPayload) {
        console.log("*login data  = ", payload)

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


        return data;
    }

}