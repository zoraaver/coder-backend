import * as subsectionsController from "../controllers/subsectionsController";
import { Router } from "express";

export const subsectionRoutes = Router();

subsectionRoutes.post("/", subsectionsController.create);
subsectionRoutes.patch("/:id", subsectionsController.update);
subsectionRoutes.put("/:id", subsectionsController.update);
subsectionRoutes.delete("/:id", subsectionsController.destroy);
