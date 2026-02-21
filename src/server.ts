import express, { Application, Request, Response } from "express";
import { app } from "./app";
import { envVars } from "./app/config/env";

// console.log("port -= ", process.env.PORT)

const bootstrap = () => {
    try {
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        console.log("Filed to start srever", error)
    }
}

bootstrap();