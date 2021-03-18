import { Router } from "express";
import * as lessonsController from "../controllers/lessonsController";
import { isAdmin } from "../middleware/auth";
import { requireLessonInRequestBody } from "../middleware/lesson";

export const lessonRoutes = Router();

lessonRoutes.post(
  "/",
  isAdmin,
  requireLessonInRequestBody,
  lessonsController.create
);

lessonRoutes.get("/:id/edit", isAdmin, lessonsController.edit);
lessonRoutes.get("/:id", lessonsController.show);
