import { Request, Response, NextFunction } from "express";
import { Section } from "../models/section";
import { Subsection } from "../models/subsection";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { title, section_id } = req.body.subsection;
  const section: Section | null = await Section.findByPk(section_id, {
    include: [
      {
        model: Subsection,
        as: "subsections",
        attributes: ["sort_id"],
        order: [["sort_id", "DESC"]],
        separate: true,
        limit: 1,
      },
    ],
  });
  if (!section) {
    res.status(406).json({ message: `Invalid section id, ${section_id}` });
    return;
  }
  const nextSortId: number = section.subsections.length
    ? section.subsections[0].sort_id + 1
    : 0;

  try {
    const subsection: Subsection = await Subsection.create({
      section_id,
      title,
      sort_id: nextSortId,
    });
    res.status(201).json({
      subsection: { ...subsection.dataValues, lessons: [], completed: 0 },
      section_id,
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
  const id: string = req.params.id;
  let subsection: Subsection | null = await Subsection.findByPk(id);
  if (!subsection) {
    res.status(404).json({ message: `Cannot find subsection with id ${id}` });
    return;
  }

  try {
    subsection = await subsection.update(req.body.subsection);
    res.json({
      id: subsection.id,
      title: subsection.title,
      section_id: subsection.section_id,
    });
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
  const subsection: Subsection | null = await Subsection.findByPk(id);
  if (subsection) {
    await subsection.destroy();
    res.json({ section_id: subsection.section_id, id: subsection.id });
    return;
  }
  res.status(404).json({ message: `Cannot find subsection with id ${id}` });
}
