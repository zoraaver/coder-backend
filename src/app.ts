import express, { Application } from "express";
import { isAdmin, loggedIn, setCurrentUser } from "./middleware/auth";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { courseRoutes } from "./routes/courseRoutes";
import { sectionRoutes } from "./routes/sectionRoutes";
import { subsectionRoutes } from "./routes/subsectionRoutes";
import { lessonRoutes } from "./routes/lessonRoutes";
import morgan from "morgan";
import cors from "cors";
import helmet from 'helmet';

export const app: Application = express();

// prevent CORS errors
app.use(cors());

// security
app.use(helmet());

// logging for development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// parse incoming requests as JSON
app.use(express.json());

// set current user (if present) for all incoming requests
app.use(setCurrentUser);

app.use(authRoutes);
app.use("/users", userRoutes);
app.use("/courses", loggedIn, courseRoutes);
app.use("/sections", loggedIn, isAdmin, sectionRoutes);
app.use("/subsections", loggedIn, isAdmin, subsectionRoutes);
app.use("/lessons", loggedIn, lessonRoutes);
