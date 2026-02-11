import express, { Application, Request, Response } from "express";
import { app } from "./app";

// console.log("port -= ", process.env.PORT)

const bootstrap = () => {
    try {
        app.listen(5000, () => {
            console.log(`Server is running on http://localhost:${5000}`);
        });
    } catch (error) {
        console.log("Filed to start srever", error)
    }
}

bootstrap();