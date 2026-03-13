import express, { Application, Request, Response } from "express";
import { app } from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seeds";

// console.log("port -= ", process.env.PORT)

const bootstrap = async () => {
    try {
        //seeding superAdmin 
        await seedSuperAdmin();
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        console.log("Filed to start srever", error)
    }
}

bootstrap();