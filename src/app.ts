import express, { Application, Request, Response } from 'express';
import { prisma } from './app/lib/prisma';
import { formatInTimeZone } from 'date-fns-tz';
import route from './app/routes';

export const app: Application = express()


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
// app.get('/', async (req: Request, res: Response) => {

//     const result = await prisma.specialty.create({
//         data: { title: "Demo one" }
//     })

//     //local time
//     const localCreatedAt = formatInTimeZone(result.createdAt, "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss")
//     const localUpdatedAt = formatInTimeZone(result.updatedAt, "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss")

//     res.status(201).json({
//         sucess: true,
//         message: "api is working",
//         data: {
//             ...result,
//             createdAt: localCreatedAt,
//             updatedAt: localUpdatedAt
//         }
//     })
// });

app.use("/api/v1/", route);

