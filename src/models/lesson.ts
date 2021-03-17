import { DataTypes, Model } from "sequelize";
import { sequelize } from "../util/database";

export class Lesson extends Model {}

Lesson.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    subsection_id: DataTypes.INTEGER,
    test: DataTypes.TEXT,
    starter_code: DataTypes.TEXT,
    language: DataTypes.STRING,
    content: DataTypes.STRING,
    sort_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    modelName: "Lesson",
    tableName: "lessons",
  }
);

