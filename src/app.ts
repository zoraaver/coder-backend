import { sequelize } from "./util/database";
// import { User } from "./models/user";
import { Course } from "./models/course";
import { Section } from "./models/section";

sequelize
  .authenticate()
  .then(async () => {
    console.log("Successfully connected");
    const courses: Course[] = await Course.findAll({where: {id: 1}, include: Section});
    // console.log(courses)
    const sections: Section[] = courses[0].sections;
    // sections.every((section: Section) => console.log(section))
    console.log(sections);

  })
  .catch((error) => {
    console.error(error);
  });
