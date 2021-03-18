import { Request, Response, NextFunction } from "express";

export async function requireSubsectionInRequestBody(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.body.subsection) {
    res
      .status(406)
      .json({
        message: "Please attach a subsection field to the request body",
      });
  } else {
    next();
  }
}
