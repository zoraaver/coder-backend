import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "../util/database";
import { Lesson } from "./lesson";
import { UserLesson } from "./userlesson";

export class Subsection extends Model {
  lessons!: Lesson[];
  dataValues: any;

  async completed(userId: number): Promise<number> {
    const total: number = await UserLesson.sum("status", {
      where: {
        user_id: userId,
        lesson_id: { [Op.in]: this.lessons.map((l: Lesson) => l.id) },
      },
    });
    const lessonCount: number = this.lessons.length;
    switch (total) {
      case 0:
        return 0;
      case 2 * lessonCount:
        return 2;
      default:
        return 1;
    }
  }
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
