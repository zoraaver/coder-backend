import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "../util/database";
import { Subsection } from "./subsection";
import { UserLesson } from "./userlesson";

export class Lesson extends Model {
  id!: string;
  dataValues: any;
  sort_id!: number;
  test!: string;
  starter_code!: string;
  subsection_id!: number;
  subsection!: Subsection;
  language!: string;
  content!: string;
  title!: string;

  async completed(userId: number): Promise<number> {
    const userLesson = await UserLesson.findOne({
      where: { user_id: userId, lesson_id: this.id },
    });
    if (userLesson) return userLesson.status;
    return 0;
  }

  async previousLesson(): Promise<Lesson | null> {
    let lesson: Lesson | null = await Lesson.findOne({
      where: {
        subsection_id: this.subsection_id,
        sort_id: { [Op.lt]: this.sort_id },
      },
      order: [["sort_id", "DESC"]],
      limit: 1,
    });
    if (!lesson) {
      const previousSubsection: Subsection | null = await this.subsection.previousSubsection();
      if (!previousSubsection) return null;
      lesson = await Lesson.findOne({
        where: { subsection_id: previousSubsection.id },
        order: [["sort_id", "DESC"]],
        limit: 1,
      });
    }
    return lesson;
  }

  async nextLesson(): Promise<Lesson | null> {
    let lesson: Lesson | null = await Lesson.findOne({
      where: {
        subsection_id: this.subsection_id,
        sort_id: { [Op.gt]: this.sort_id },
      },
      order: [["sort_id", "ASC"]],
      limit: 1,
    });
    if (!lesson) {
      const nextSubsection: Subsection | null = await this.subsection.nextSubsection();
      if (!nextSubsection) return null;
      lesson = await Lesson.findOne({
        where: { subsection_id: nextSubsection.id },
        order: [["sort_id", "ASC"]],
        limit: 1,
      });
    }
    return lesson;
  }
}

Lesson.init(
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
    subsection_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Subsection id is a mandatory field",
        },
      },
    },
    test: DataTypes.TEXT,
    starter_code: DataTypes.TEXT,
    language: DataTypes.STRING,
    content: DataTypes.TEXT,
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
