import * as coursesController from "../controllers/coursesController";
import { Router } from "express";

export const courseRoutes = Router();

courseRoutes.get("/", coursesController.index);
courseRoutes.get("/:id", coursesController.show);
