import * as sectionsController from "../controllers/sectionsController";
import { Router } from "express";
import { requireSectionInRequestBody } from "../middleware/section";

export const sectionRoutes = Router();

sectionRoutes.post("/", requireSectionInRequestBody, sectionsController.create);

sectionRoutes.patch(
  "/:id",
  requireSectionInRequestBody,
  sectionsController.update
);
sectionRoutes.put(
  "/:id",
  requireSectionInRequestBody,
  sectionsController.update
);

sectionRoutes.delete("/:id", sectionsController.destroy);
