import { Request, Response, NextFunction } from "express";
import { Lesson } from "../models/lesson";
import { Section } from "../models/section";
import { Subsection } from "../models/subsection";
import { UserLesson } from "../models/userlesson";
import fs from "fs/promises";
import util from "util";

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

type Language = "cpp" | "ruby" | "javascript";

export async function test(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const uniqueId: string = (req.currentUserId as number).toString();
  const { id, code, language } = req.body;

  if (checkForForbiddenWords(code, language)) {
    res.status(406).json({ error: "Invalid submission" });
    return;
  }

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

  userLesson.update({ code });

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

  const resultsPath = `./dist/${uniqueId}results.json`;
  const errorsPath = `./dist/${uniqueId}errors.txt`;
  const codePath = `./dist/code${uniqueId + extension}`;
  const testPath = `./dist/test${uniqueId + extension}`;
  const executablePath = `./dist/test${uniqueId}.o`;

  const testFiles = [
    { path: resultsPath, data: "" },
    { path: errorsPath, data: "" },
    { path: codePath, data: code },
    { path: testPath, data: testCode },
    { path: executablePath, data: "" },
  ];

  try {
    await writeAllTestFiles(testFiles);
  } catch {
    res.status(500).json({ message: "Some error occurred. Please try later." });
    return;
  }
  let passed: boolean = false;
  try {
    passed = await runTests(
      language,
      testPath,
      resultsPath,
      errorsPath,
      executablePath
    );
  } catch (error) {}

  if (passed) await userLesson.update({ status: 2 });

  res.json(await readErrorsAndResultsFiles(errorsPath, resultsPath));

  try {
    await deleteAllTestFiles(testFiles);
  } catch (error) {}
}

async function readErrorsAndResultsFiles(
  errorsPath: string,
  resultsPath: string
): Promise<{ error: string; results: string }> {
  const errorFileRead = fs.readFile(errorsPath, "utf-8");
  const resultsFileRead = fs.readFile(resultsPath, "utf-8");
  return { error: await errorFileRead, results: await resultsFileRead };
}

async function deleteAllTestFiles(
  files: Array<{ path: string; data: string }>
) {
  const allFilesDeleted: Promise<void>[] = [];

  for (let file of files) {
    allFilesDeleted.push(fs.unlink(file.path));
  }

  return Promise.all(allFilesDeleted);
}

async function writeAllTestFiles(files: Array<{ path: string; data: string }>) {
  const allFilesWritten: Promise<void>[] = [];

  for (let file of files) {
    allFilesWritten.push(fs.writeFile(file.path, file.data));
  }
  return Promise.all(allFilesWritten);
}

function checkForForbiddenWords(code: string, language: Language): boolean {
  const forbiddenWords = {
    cpp: ["include", "define", "system", "FILE", "fstream", "fopen", "cin"],
    ruby: ["system", "File", "gets", "IO", "Dir", "Kernel", "require"],
    javascript: ["require", "import"],
  };

  for (let forbiddenWord of forbiddenWords[language]) {
    if (code.search(new RegExp(forbiddenWord)) >= 0) {
      return true;
    }
  }
  return false;
}

async function runTests(
  language: Language,
  testPath: string,
  resultsPath: string,
  errorsPath: string,
  executablePath: string
): Promise<boolean> {
  const exec: Function = util.promisify(require("child_process").exec);
  let passed: boolean = false;
  switch (language) {
    case "ruby":
      await exec(`rspec ${testPath} --format json --out ${resultsPath}`);
      passed = true;
      break;
    case "javascript":
      await exec(
        `npx mocha ${testPath} --timeout 5000 -R json 1> ${resultsPath} 2> ${errorsPath}`
      );
      passed = true;
      break;
    case "cpp":
      await exec(
        `g++ ${testPath} -std=c++17 -lgtest -pthread -o ${executablePath} 2> ${errorsPath}`
      );
      await exec(`${executablePath} --gtest_output='json:${resultsPath}'`);
      passed = true;
      break;
    default:
  }
  return passed;
}
