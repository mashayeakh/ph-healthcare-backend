import express from 'express';
import { SpecialtyController } from './specialty.controller';
const route = express();


route.post("/", SpecialtyController.specialtyCreate);

route.get("/", SpecialtyController.viewAllSpecialty);

export const SpecialtyRouter = route;