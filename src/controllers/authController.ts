import { Request, Response, NextFunction } from "express";
import { Course } from "../models/course";
import { User } from "../models/user";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, password } = req.body.user;
  const user = await User.findOne({
    where: { email },
    attributes: ["id", "email", "admin", "password_digest"],
    include: {
      model: Course,
      as: "courses",
      attributes: ["id", "title", "description", "img_url"],
    },
  });
  if (user && user.authenticate(password)) {
    res.json({
      email: user.email,
      token: user.getToken(),
      courses: user.courses,
      admin: user.admin,
    });
  } else {
    res.status(401).json({
      message: "We couldn't find a user with that email and password",
    });
  }
}
