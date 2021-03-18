import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";

export function setCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader: string | undefined =
    req.get("Authorization") || req.get("Authorisation");
  if (!authHeader) {
    req.currentUserId = undefined;
    next();
  } else {
    try {
      req.currentUserId = Number(
        jwt.verify(authHeader, process.env.JWT_SECRET as string)
      );
      next();
    } catch (error) {
      next();
    }
  }
}

export function loggedIn(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.currentUserId) {
    res
      .status(401)
      .json({ message: "You need to be logged in to see this page." });
  } else {
    next();
  }
  return;
}

export async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user: User | null = await User.findByPk(req.currentUserId);
  if (!user || !user.admin) {
    res.status(401).json({ message: "This action requires admin access." });
    return;
  }
  next();
}
