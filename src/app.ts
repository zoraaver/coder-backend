import { sequelize } from "./util/database";

sequelize
  .authenticate()
  .then(() => {
    console.log("Successfully connected to database.");

  })
  .catch((error) => {
    console.error(error);
  });
