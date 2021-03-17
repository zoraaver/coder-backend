import { sequelize } from "../util/database";
import { DataTypes, Model } from "sequelize";

export class UserLesson extends Model {}

UserLesson.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    lesson_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    code: DataTypes.TEXT,
  },
  {
    sequelize,
    timestamps: false,
    tableName: "user_lessons",
    modelName: "UserLesson",
  }
);
