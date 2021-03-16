import { DataTypes, Model } from "sequelize";
import { sequelize } from "../util/database";

export class Section extends Model {
}

Section.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    course_id: DataTypes.INTEGER,
    sort_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Section",
    tableName: "sections",
    timestamps: false,
  }
);

