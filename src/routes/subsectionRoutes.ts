import * as subsectionsController from "../controllers/subsectionsController";
import { Router } from "express";
import { requireSubsectionInRequestBody } from "../middleware/subsection";

export const subsectionRoutes = Router();

subsectionRoutes.post(
  "/",
  requireSubsectionInRequestBody,
  subsectionsController.create
);
subsectionRoutes.patch(
  "/:id",
  requireSubsectionInRequestBody,
  subsectionsController.update
);
subsectionRoutes.put(
  "/:id",
  requireSubsectionInRequestBody,
  subsectionsController.update
);
subsectionRoutes.delete("/:id", subsectionsController.destroy);
