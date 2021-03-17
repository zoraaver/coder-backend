import { Router } from "express";
import * as usersController from "../controllers/usersController";
import { requireUserInRequestBody } from "../middleware/user";

export const userRoutes = Router();

userRoutes.post("/", requireUserInRequestBody, usersController.create);
