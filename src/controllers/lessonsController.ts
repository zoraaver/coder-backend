import { Request, Response, NextFunction } from "express";
import { Lesson } from "../models/lesson";
import { Section } from "../models/section";
import { Subsection } from "../models/subsection";
import { UserLesson } from "../models/userlesson";
import fs from "fs/promises";
import util from "util";
import path from "path";

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

export async function completeLesson(
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
  const userLesson: UserLesson | null = await UserLesson.findOne({
    where: { lesson_id: lesson.id, user_id: req.currentUserId },
  });

  if (!userLesson) {
    res
      .status(404)
      .json({ message: `Cannot find userLesson with lesson_id ${lesson.id}` });
    return;
  }
  await userLesson.update({ status: 2 });
  res.json({ message: "Lesson completed successfully" });
}

export async function test(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const uniqueId: string = (req.currentUserId as number).toString();
  const { id, code, language } = req.body;

  const lesson: Lesson | null = await Lesson.findByPk(id);
  if (!lesson) {
    res.status(404).json({ message: `Cannot find lesson with id ${id}` });
    return;
  }

  const userLesson: UserLesson | null = await UserLesson.findOne({
    where: { user_id: req.currentUserId, lesson_id: id },
  });

  if (!userLesson) {
    res
      .status(404)
      .json({ message: `Cannot find userLesson with lesson_id ${id}` });
    return;
  }

  userLesson.update({ code: req.body.code });

  const extensions = {
    cpp: ".cpp",
    ruby: ".rb",
    javascript: ".js",
  };

  const extension = extensions[lesson.language];

  const textToReplace = new RegExp(`code${extension}`, "g");
  const testCode: string = lesson.test.replace(
    textToReplace,
    `code${uniqueId + extension}`
  );
  const forbiddenWords = {
    cpp: ["include", "define", "system", "FILE", "fstream", "fopen", "cin"],
    ruby: ["system", "File", "gets", "IO", "Dir", "Kernel", "require"],
    javascript: ["require", "import"],
  };

  for (let forbiddenWord of forbiddenWords[lesson.language]) {
    if (code.search(new RegExp(forbiddenWord)) >= 0) {
      res.json({ error: "Invalid submission", results: "" });
    return;
    }
  }

  await fs.writeFile(
    path.join(__dirname, "..", `code${uniqueId + extension}`),
    code
  );
  await fs.writeFile(
    path.join(__dirname, "..", `test${uniqueId + extension}`),
    testCode
  );

  let passed: boolean = false;
  try {
    await fs.writeFile(
      path.join(__dirname, "..", `${uniqueId}results.json`),
      ""
    );
    await fs.writeFile(path.join(__dirname, "..", `${uniqueId}errors.txt`), "");
    const exec = util.promisify(require("child_process").exec);

    switch (language) {
      case "ruby":
        await exec(
          `rspec ./dist/test${uniqueId}.rb --format json --out ./dist/${uniqueId}results.json`
        );
        passed = true;
        break;
      case "javascript":
        await exec(
          `mocha ./dist/test${uniqueId}.js --timeout 5000 -R json 1> ./dist/${uniqueId}results.json 2> ./dist/${uniqueId}errors.txt`
        );
        passed = true;
        break;
      case "cpp":
        await exec(
          `g++ ./dist/test${uniqueId}.cpp -std=c++17 -lgtest -pthread -o ./dist/test${uniqueId}.o 2> ./dist/${uniqueId}errors.txt`
        );
        passed = true;
        await exec(
          `./dist/test${uniqueId}.o --gtest_output='json:./dist/${uniqueId}results.json'`
        );
        fs.unlink(`./dist/test${uniqueId}.o`);
        break;
      default:
        res.status(406).json({ message: `Invalid language ${language}` });
    }
  } catch (error) {
    console.error(error.message);
  }

  if (passed) await userLesson.update({ status: 2 });

  const error: string = await fs.readFile(`./dist/${uniqueId}errors.txt`, {
    encoding: "utf-8",
  });
  const results: string = await fs.readFile(`./dist/${uniqueId}results.json`, {
    encoding: "utf-8",
  });

  res.json({
    results,
    error,
  });

  const allFilesDeleted: Promise<void>[] = [
    fs.unlink(`./dist/${uniqueId}results.json`),
    fs.unlink(`./dist/${uniqueId}errors.txt`),
    fs.unlink(path.join(__dirname, "..", `code${uniqueId + extension}`)),
    fs.unlink(path.join(__dirname, "..", `test${uniqueId + extension}`)),
  ];

  await Promise.all(allFilesDeleted);
}
