import { Request, Response, NextFunction } from "express";

export async function requireLessonInRequestBody(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.body.lesson) {
    res
      .status(406)
      .json({ message: "Please attach a lesson field to the request body" });
  } else {
    next();
  }
}
