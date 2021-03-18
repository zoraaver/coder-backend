import * as sectionsController from "../controllers/sectionsController";
import { Router } from "express";

export const sectionRoutes = Router();

sectionRoutes.post("/", sectionsController.create);
sectionRoutes.patch("/:id", sectionsController.update);
sectionRoutes.put("/:id", sectionsController.update);
sectionRoutes.delete("/:id", sectionsController.destroy);
