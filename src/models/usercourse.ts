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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "UserCourse",
    tableName: "user_courses",
  }
);
