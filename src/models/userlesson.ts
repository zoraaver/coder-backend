import { sequelize } from "../util/database";
import { DataTypes, Model } from "sequelize";
import { User } from "./user";
import { Lesson } from "./lesson";

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
      references: {
        model: Lesson,
        key: "lesson_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
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
