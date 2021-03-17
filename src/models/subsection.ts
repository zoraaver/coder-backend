import { DataTypes, Model } from "sequelize";
import { sequelize } from "../util/database";
import { Lesson } from "./lesson";

export class Subsection extends Model {
  lessons!: Lesson[];
}

Subsection.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    section_id: DataTypes.INTEGER,
    sort_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "subsections",
    modelName: "Subsection",
    timestamps: false,
  }
);

Subsection.hasMany(Lesson, {
  foreignKey: "subsection_id",
  as: "lessons",
});
