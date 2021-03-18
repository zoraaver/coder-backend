import { Router } from "express";
import * as authController from "../controllers/authController";
import { requireUserInRequestBody } from "../middleware/user";

export const authRoutes = Router();

authRoutes.post("/login", requireUserInRequestBody, authController.login);

authRoutes.get("/validate", authController.validate);
