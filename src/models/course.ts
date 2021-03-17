import { Model, DataTypes } from "sequelize";
import { Section } from "./section";
import { sequelize } from "../util/database";

export class Course extends Model {
  sections!: Section[];
}

Course.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    img_url: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "courses",
    modelName: "Course",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Course.hasMany(Section, {
  foreignKey: "course_id",
  as: 'sections'
});

Section.belongsTo(Course, {
  foreignKey: "course_id",
  as: 'course'
});
