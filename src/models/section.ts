import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "../util/database";
import { Lesson } from "./lesson";
import { Subsection } from "./subsection";
import { UserLesson } from "./userlesson";

export class Section extends Model {
  subsections!: Subsection[];
  dataValues: any;

  async completed(userId: number): Promise<number> {
    const total: number = await UserLesson.sum("status", {
      where: {
        user_id: userId,
        lesson_id: {
          [Op.in]: this.subsections
            .map((s: Subsection) => {
              return s.lessons.map((l: Lesson) => l.id);
            })
            .flat(),
        },
      },
    });
    const lessonCount: number = this.subsections
      .map((s: Subsection) => s.lessons.length)
      .reduce((total: number, curr: number) => total + curr, 0);
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
