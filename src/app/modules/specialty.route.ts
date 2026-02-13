import express from 'express';
import { SpecialtyController } from './specialty.controller';
const route = express();


route.post("/", SpecialtyController.specialtyCreate);

route.get("/", SpecialtyController.getAllSpecialty);

route.delete("/:id", SpecialtyController.deleteSpecialty);



export const SpecialtyRouter = route;