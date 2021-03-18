import { Request, Response, NextFunction } from "express";
import { Course } from "../models/course";
import { Section } from "../models/section";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { title, course_id } = req.body.section;
  const course: Course | null = await Course.findByPk(course_id, {
    include: [
      {
        model: Section,
        as: "sections",
        attributes: ["sort_id"],
        order: [["sort_id", "DESC"]],
        separate: true,
        limit: 1,
      },
    ],
  });
  if (!course) {
    res.status(406).json({ message: "Invalid course id" });
    return;
  }
  const nextSortId: number = course.sections.length
    ? course.sections[0].sort_id + 1
    : 0;

  try {
    const section: Section = await Section.create({
      course_id,
      title,
      sort_id: nextSortId,
    });
    res.json({
      ...section.dataValues,
      completed: 0,
      subsections: [],
    });
  } catch (error) {
    res.status(406).json({ message: error.message });
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sectionId: string = req.params.id;
  let section: Section | null = await Section.findByPk(sectionId);
  if (!section) {
    res.status(404).json({ message: "Cannot find section with that id" });
    return;
  }

  try {
    section = await section.update(req.body.section);
    res.json({ id: section.id, title: section.title });
  } catch (error) {
    res.status(406).json({ message: error.message });
  }
}

export async function destroy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id: string = req.params.id;
  if (await Section.destroy({ where: { id } })) {
    res.json(id);
    return;
  }
  res.status(404).json({ message: "Cannot find section with that id" });
}
