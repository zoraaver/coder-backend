import { sequelize } from "./util/database";
import express, { Application } from "express";
import { isAdmin, loggedIn, setCurrentUser } from "./middleware/auth";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { courseRoutes } from "./routes/courseRoutes";
import { sectionRoutes } from "./routes/sectionRoutes";
import { subsectionRoutes } from "./routes/subsectionRoutes";

const app: Application = express();

// parse incoming requests as JSON
app.use(express.json());

// set current user (if present) for all incoming requests
app.use(setCurrentUser);

app.use(authRoutes);
app.use("/users", userRoutes);
app.use("/courses", loggedIn, courseRoutes);
app.use("/sections", loggedIn, isAdmin, sectionRoutes);
app.use("/subsections", loggedIn, isAdmin, subsectionRoutes);

sequelize
  .authenticate()
  .then(async () => {
    console.log("Successfully connected to database.");
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Listening on port ${process.env.PORT || 8080}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
