import express, { Application, Request, Response } from 'express';
import { prisma } from './app/lib/prisma';
import { formatInTimeZone } from 'date-fns-tz';
import route from './app/routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

export const app: Application = express()


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(cors({
    origin: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
    credentials: true // Important for cookies
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/", route);

