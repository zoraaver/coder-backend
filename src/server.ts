import { app } from "./app";
import { sequelize } from "./util/database";

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
