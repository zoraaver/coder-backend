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
  if (user && await user.authenticate(password)) {
    user.setToken();
    res.json({ ...user.dataValues, password_digest: null });
  } else {
    res.status(401).json({
      message: "We couldn't find a user with that email and password",
    });
  }
}

export async function validate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.currentUserId) {
    const user: User | null = await User.findByPk(req.currentUserId, {
      attributes: ["id", "email", "admin"],
      include: {
        model: Course,
        as: "courses",
        attributes: ["id", "title", "description", "img_url"],
      },
    });
    if (!user) {
      res.status(404).json({ message: "User cannot be found." });
      return;
    }
    user.setToken();
    res.json(user);
  }
}
