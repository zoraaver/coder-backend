import { Request, Response, NextFunction } from "express";

export async function requireSectionInRequestBody(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.body.section) {
    res
      .status(406)
      .json({ message: "Please attach a section field to the request body" });
  } else {
    next();
  }
}
