import { Request, Response, NextFunction } from "express";
import { Lesson } from "../models/lesson";
import { Section } from "../models/section";
import { Subsection } from "../models/subsection";
import { UserLesson } from "../models/userlesson";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { subsection_id } = req.body.lesson;
  const subsection: Subsection | null = await Subsection.findByPk(
    subsection_id,
    {
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["sort_id"],
          order: [["sort_id", "DESC"]],
          separate: true,
          limit: 1,
        },
      ],
    }
  );
  if (!subsection) {
    res.status(406).json({ message: "Invalid subsection id" });
    return;
  }
  const nextSortId: number = subsection.lessons.length
    ? subsection.lessons[0].sort_id + 1
    : 0;

  try {
    const lesson: Lesson = await Lesson.create({
      ...req.body.lesson,
      sort_id: nextSortId,
    });
    res.status(201).json(Number(lesson.id));
  } catch (error) {
    res.status(406).json({ message: error.message });
  }
}

export async function edit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const lesson: Lesson | null = await Lesson.findByPk(req.params.id);
  if (!lesson) {
    res
      .status(404)
      .json({ message: `No lesson with id ${req.params.id} can be found.` });
    return;
  }
  res.json({
    test: lesson.test,
    starter_code: lesson.starter_code,
    subsection_id: lesson.subsection_id,
    title: lesson.title,
    content: lesson.content,
    language: lesson.language,
  });
}

export async function show(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const lesson: Lesson | null = await Lesson.findByPk(req.params.id, {
    include: {
      model: Subsection,
      as: "subsection",
      include: [{ model: Section, as: "section" }],
    },
  });
  if (!lesson) {
    res
      .status(404)
      .json({ message: `No lesson with id ${req.params.id} can be found.` });
    return;
  }
  const [userLesson]: [UserLesson, boolean] = await UserLesson.findOrCreate({
    where: { lesson_id: lesson.id, user_id: req.currentUserId },
    defaults: { lesson_id: lesson.id, user_id: req.currentUserId },
  });
  const nextLesson: Lesson | null = await lesson.nextLesson();
  const previousLesson: Lesson | null = await lesson.previousLesson();

  res.json({
    test: !!lesson.test,
    status: userLesson.status,
    starter_code: lesson.starter_code,
    code: userLesson.code,
    content: lesson.content,
    id: lesson.id,
    title: lesson.title,
    language: lesson.language,
    nextLesson: nextLesson
      ? { title: nextLesson.title, id: nextLesson.id }
      : null,
    previousLesson: previousLesson
      ? { title: previousLesson.title, id: previousLesson.id }
      : null,
  });
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id: string = req.params.id;
  const lesson: Lesson | null = await Lesson.findByPk(id);
  if (!lesson) {
    res.status(404).json({ message: `Cannot find lesson with id ${id}` });
    return;
  }
  try {
    await lesson.update(req.body.lesson);
    res.json(Number(lesson.id));
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
  const lesson: Lesson | null = await Lesson.findByPk(id);
  if (!lesson) {
    res.status(404).json({ message: `Cannot find lesson with id ${id}` });
    return;
  }
  await lesson.destroy();
  res.json(Number(lesson.id));
}
