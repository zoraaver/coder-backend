import { Request, Response, NextFunction } from "express";
import { Course } from "../models/course";
import { Lesson } from "../models/lesson";
import { Section } from "../models/section";
import { Subsection } from "../models/subsection";
import { UserCourse } from "../models/usercourse";

export async function index(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const courses: Course[] = await Course.findAll({
    attributes: ["id", "title", "description", "img_url"],
  });
  res.json(courses);
}

export async function show(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id: string = req.params.id;
  const course: Course | null = await Course.findByPk(id, {
    attributes: ["id", "title"],
    include: {
      model: Section,
      as: "sections",
      attributes: ["id", "title", "sort_id"],
      separate: true,
      order: ["sort_id"],
      include: [
        {
          model: Subsection,
          as: "subsections",
          attributes: ["id", "title"],
          separate: true,
          order: ["sort_id"],
          include: [
            {
              model: Lesson,
              as: "lessons",
              attributes: ["id", "title"],
              separate: true,
              order: ["sort_id"],
            },
          ],
        },
      ],
    },
  });
  if (!course) {
    res.status(404).json("Cannot find course with that id");
    return;
  }
  await UserCourse.findOrCreate({
    where: { user_id: req.currentUserId, course_id: id },
  });

  res.json(await serializeCourse(req.currentUserId as number, course));
}

async function serializeCourse(userId: number, course: Course) {
  return {
    ...course.dataValues,
    sections: await Promise.all(
      course.sections.map(async (section: Section) => ({
        ...section.dataValues,
        completed: await section.completed(userId),
        subsections: await Promise.all(
          section.subsections.map(
            async (subsection: Subsection): Promise<any> => ({
              ...subsection.dataValues,
              completed: await subsection.completed(userId),
              lessons: await Promise.all(
                subsection.lessons.map(async (lesson: Lesson) => {
                  return {
                    ...lesson.dataValues,
                    completed: await lesson.completed(userId),
                  };
                })
              ),
            })
          )
        ),
      }))
    ),
  };
}
