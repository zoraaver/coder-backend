import { Model, DataTypes } from "sequelize";
import { sequelize } from "../util/database";
import { Course } from "./course";
import { Lesson } from "./lesson";
import { UserCourse } from "./usercourse";
import { UserLesson } from "./userlesson";

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    email: DataTypes.STRING,
    password_digest: DataTypes.STRING,
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

User.hasMany(UserLesson, { foreignKey: "user_id", as: "userlessons" });

User.belongsToMany(Lesson, {
  through: UserLesson,
  uniqueKey: "id",
  foreignKey: "user_id",
  as: "lessons",
});

Lesson.belongsToMany(User, {
  through: UserLesson,
  uniqueKey: "id",
  foreignKey: "lesson_id",
  as: "users",
});

Lesson.hasMany(UserLesson, { foreignKey: "lesson_id", as: "userlessons" });

User.hasMany(UserCourse, { foreignKey: "user_id", as: "userCourses" });

User.belongsToMany(Course, {
  through: UserCourse,
  foreignKey: "user_id",
  uniqueKey: "id",
  as: "courses"
});
Course.belongsToMany(User, {
  through: UserCourse,
  foreignKey: "course_id",
  uniqueKey: "id",
  as: "users"
});
