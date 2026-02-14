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
    }

}