import { halls as rawHalls } from "../catalog.js";
import { labTalks } from "../lab-talks.js";
import { hallTheme } from "../hall-theme.js";
import { questionDifficulty, questionTitle, questionTrigger } from "../question-catalog.js";

export type Source = readonly [label: string, url: string];

export type Lesson = {
  id: string;
  name: string;
  tag: string;
  intro: string;
  idea: string;
  question: string;
  choices: readonly string[];
  answer: number;
  sources?: readonly Source[];
};

export type Hall = {
  id: string;
  name: string;
  summary: string;
  lessons: readonly Lesson[];
};

export type Topic = Lesson & {
  hall: Hall;
  title: string;
  trigger: string;
  difficulty: 1 | 2 | 3;
};

/** 一轮「小念问爸爸」；scene 是交给实验 demo(...) 的参数，摆出这一轮要看的画面 */
export type Turn = { scene: readonly unknown[]; nian: string; dad: string };

export const halls = rawHalls as unknown as readonly Hall[];

export const topics: readonly Topic[] = halls.flatMap((hall) =>
  hall.lessons.map((lesson) => ({
    ...lesson,
    hall,
    title: questionTitle(lesson) as string,
    trigger: questionTrigger(lesson) as string,
    difficulty: questionDifficulty(lesson) as 1 | 2 | 3,
  }))
);

const byId = new Map(topics.map((topic) => [topic.id, topic]));
export const topicById = (id: string | undefined) => (id ? byId.get(id) : undefined);
export const hallById = (id: string | undefined) => halls.find((hall) => hall.id === id);

const talks = labTalks as Record<string, readonly Turn[]>;
export const turnsFor = (id: string): readonly Turn[] => talks[id] ?? [];

export const themeOf = (hallId: string) => (hallTheme as Record<string, { emoji: string; hex: string }>)[hallId];

/** 同一展馆里的下一题，转到头再从第一题开始 */
export function neighbors(topic: Topic) {
  const list = topic.hall.lessons;
  const index = list.findIndex((lesson) => lesson.id === topic.id);
  const at = (offset: number) => topicById(list[(index + offset + list.length) % list.length].id)!;
  return { prev: at(-1), next: at(1) };
}
