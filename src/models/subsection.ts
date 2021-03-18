import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "../util/database";
import { Lesson } from "./lesson";
import { UserLesson } from "./userlesson";

export class Subsection extends Model {
  lessons!: Lesson[];
  dataValues: any;
  sort_id!: number;
  id!: number;
  title!: string;
  section_id!: number;

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
    title: {
      type: DataTypes.INTEGER,
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
