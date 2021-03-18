import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "../util/database";
import { Lesson } from "./lesson";
import { Section } from "./section";
import { UserLesson } from "./userlesson";

export class Subsection extends Model {
  lessons!: Lesson[];
  dataValues: any;
  sort_id!: number;
  id!: number;
  title!: string;
  section_id!: number;
  section!: Section;

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

  async previousSubsection(): Promise<Subsection | null> {
    let subsection: Subsection | null = await Subsection.findOne({
      where: {
        section_id: this.section_id,
        sort_id: { [Op.lt]: this.sort_id },
      },
      order: [["sort_id", "DESC"]],
      limit: 1,
    });
    if (!subsection) {
      const previousSection: Section | null = await this.section.previousSection();
      if (!previousSection) return null;
      subsection = await Subsection.findOne({
        where: { section_id: previousSection.id },
        order: [["sort_id", "DESC"]],
        limit: 1,
      });
    }
    return subsection;
  }

  async nextSubsection(): Promise<Subsection | null> {
    let subsection: Subsection | null = await Subsection.findOne({
      where: {
        section_id: this.section_id,
        sort_id: { [Op.gt]: this.sort_id },
      },
      order: [["sort_id", "ASC"]],
      limit: 1,
    });
    if (!subsection) {
      const nextSection: Section | null = await this.section.nextSection();
      if (!nextSection) return null;
      subsection = await Subsection.findOne({
        where: { section_id: nextSection.id },
        order: [["sort_id", "ASC"]],
        limit: 1,
      });
    }
    return subsection;
  }
}

Subsection.init(
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
          msg: "Title is a mandatory field",
        },
      },
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Section id is a mandatory field",
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
    tableName: "subsections",
    modelName: "Subsection",
    timestamps: false,
  }
);

Subsection.hasMany(Lesson, {
  foreignKey: "subsection_id",
  as: "lessons",
  onDelete: "CASCADE",
});

Lesson.belongsTo(Subsection, {
  as: "subsection",
  foreignKey: "subsection_id",
});
