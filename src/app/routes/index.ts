import express from 'express';
import { SpecialtyRouter } from '../modules/specialty.route';

const route = express();


route.use("/specialty", SpecialtyRouter);


export default route;