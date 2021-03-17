import { Request, Response, NextFunction } from "express";

export async function requireUserInRequestBody(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.body.user) {
    res
      .status(406)
      .json({ message: "Please attach a user field to the request body" });
  } else {
    next();
  }
}
