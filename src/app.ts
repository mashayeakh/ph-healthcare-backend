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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app: Application = express()

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



console.log('__dirname:', __dirname);
app.set("view engine", "ejs");
const viewsPath = path.join(__dirname, "app", "templates");
console.log('Setting views to:', viewsPath);
app.set("views", viewsPath);
console.log('Express views directory:', app.get('views'));

// THEN add better-auth middleware
app.use("/api/auth/", toNodeHandler(auth))



// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(cors({
    origin: process.env.BETTER_AUTH_URL || `http://localhost:${envVars.PORT}`,
    credentials: true // Important for cookies
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/", route);

//global Err
app.use(globalErrHandler);

//not found
app.use(notFound);