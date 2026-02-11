import express from 'express';
import { SpecialtyController } from './specialty.controller';
const route = express();


route.post("/", SpecialtyController.specialtyCreate);

export const SpecialtyRouter = route;