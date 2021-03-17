import { DataTypes, Model } from "sequelize";
import { sequelize } from "../util/database";
import { UserLesson } from "./userlesson";

export class Lesson extends Model {
  id!: string;
  dataValues: any;

  async completed(userId: number): Promise<number> {
    const userLesson = await UserLesson.findOne({
      where: { user_id: userId, lesson_id: this.id },
    });
    if (userLesson) return userLesson.status;
    return 0;
  }
}

Lesson.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    subsection_id: DataTypes.INTEGER,
    test: DataTypes.TEXT,
    starter_code: DataTypes.TEXT,
    language: DataTypes.STRING,
    content: DataTypes.STRING,
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
