import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "../util/database";
import { Lesson } from "./lesson";
import { Subsection } from "./subsection";
import { UserLesson } from "./userlesson";

export class Section extends Model {
  subsections!: Subsection[];
  dataValues: any;
  sort_id!: number;
  id!: number;
  title!: string;
  course_id!: number;

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

  async previousSection(): Promise<Section | null> {
    return Section.findOne({
      where: { course_id: this.course_id, sort_id: { [Op.lt]: this.sort_id } },
      order: [["sort_id", "DESC"]],
      limit: 1,
    });
  }
  async nextSection(): Promise<Section | null> {
    return Section.findOne({
      where: { course_id: this.course_id, sort_id: { [Op.gt]: this.sort_id } },
      order: [["sort_id", "ASC"]],
      limit: 1,
    });
  }
}

Section.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Title is a mandatory field.",
        },
      },
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Course id is a mandatory field.",
        },
      },
    },
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
  onDelete: "CASCADE",
});

Subsection.belongsTo(Section, {
  as: "section",
  foreignKey: "section_id",
});
