import { app } from "./app";
import { sequelize } from "./util/database";
import dotenv from "dotenv";

dotenv.config();

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Successfully connected to database.");
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Listening on port ${process.env.PORT || 8080}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
