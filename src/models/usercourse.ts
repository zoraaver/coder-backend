import { sequelize } from "../util/database";
import { DataTypes, Model } from "sequelize";

export class UserCourse extends Model {}

UserCourse.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
  },
  {
    sequelize,
    timestamps: false,
    modelName: "UserCourse",
    tableName: "user_courses",
  }
);
