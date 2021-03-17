import { sequelize } from "./util/database";
import { Course } from "./models/course";
// import { Section } from "./models/section";
// import { Subsection } from "./models/subsection";
// import { Lesson } from "./models/lesson";
import { User } from "./models/user";
// import { UserLesson } from "./models/userlesson";

sequelize
  .authenticate()
  .then(async () => {
    const user: User | null = await User.findOne({
      where: { id: 4 },
      include: {model: Course, as: "courses"}
    });
    if (!user) throw new Error("No user found");

    console.log("Successfully connected");
  })
  .catch((error) => {
    console.error(error);
  });
