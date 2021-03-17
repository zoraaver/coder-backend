import { DataTypes, Model } from "sequelize";
import { sequelize } from "../util/database";
import { Subsection } from "./subsection";

export class Section extends Model {
  subsections!: Subsection[];
  dataValues: any;
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

Section.hasMany(Subsection, {
  foreignKey: "section_id",
  as: "subsections",
});
