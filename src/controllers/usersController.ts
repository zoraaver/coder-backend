import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email, password, password_confirmation } = req.body.user;

  const user: User | null = await User.findOne({ where: { email } });

  if (user) {
    res.status(406).json({ message: "Email is already taken" });
    return;
  }

  try {
    if (password !== password_confirmation)
      throw new Error("Password and password confirmation do not match.");
    const user = User.build({
      email,
      password_digest: password,
    });
    await user.save();
    user.setToken();
    res.json({
      email: user.dataValues.email,
      token: user.dataValues.token,
      admin: user.dataValues.admin,
      courses: [],
    });
  } catch (error) {
    res.status(406).json({ message: error.message });
  }
}
