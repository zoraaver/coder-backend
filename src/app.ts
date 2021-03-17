import { sequelize } from "./util/database";
import express, { Application } from "express";
import { setCurrentUser } from "./middleware/auth";
import { authRoutes } from "./routes/authRoutes";

const app: Application = express();

// parse incoming reques as JSON
app.use(express.json());

app.use(setCurrentUser);
app.use(authRoutes);

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
