/**
 * 全站要配音的台词只在这里列一次：页面朗读、`npm run voice` 生成音频、`npm run check` 核对清单都用它，
 * 三处的文字因此一字不差。
 */
import { halls } from './catalog.js';
import { hallChats, algebraWiki, algebraTalks } from './algebra-story-data.js';
import { labTalks } from './lab-talks.js';
import { challengeCheer, challengeHint } from './question-catalog.js';

/** 大师故事卡上「听爸爸讲」念的整段话 */
export const wikiSpoken = story => `${story.scientist}的故事：${story.title}。${story.story} ${story.homeLab}`;

/** 一组小念问爸爸：每轮一问一答，最后小念收个尾 */
export const talkLines = talk => [
  ...talk.turns.flatMap(turn => [{ who: 'nian', text: turn.nian }, { who: 'dad', text: turn.dad }]),
  { who: 'nian', text: talk.wrap },
];

/** 全站台词 `{ who, text }`，按出现顺序，可能有重复 */
export function voiceLines() {
  const lines = [];
  const add = (who, text) => {
    const clean = String(text ?? '').trim();
    if (clean) lines.push({ who, text: clean });
  };
  for (const [nian, dad] of Object.values(hallChats)) { add('nian', nian); add('dad', dad); }
  for (const story of algebraWiki) add('dad', wikiSpoken(story));
  for (const talk of algebraTalks) for (const line of talkLines(talk)) add(line.who, line.text);
  for (const turns of Object.values(labTalks)) {
    for (const turn of turns) { add('nian', turn.nian); add('dad', turn.dad); }
  }
  for (const hall of halls) {
    for (const lesson of hall.lessons) { add('nian', challengeCheer(lesson)); add('dad', lesson.idea); }
  }
  add('dad', challengeHint);
  return lines;
}
