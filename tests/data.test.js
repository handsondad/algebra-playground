import test from 'node:test';
import assert from 'node:assert/strict';
import { halls } from '../src/catalog.js';
import { labTalks } from '../src/lab-talks.js';
import { labIds } from '../src/lab-modes.js';
import { homeShowcase } from '../src/question-catalog.js';
import { checkAllRules } from '../tools/check-rules.mjs';

const lessonIds = halls.flatMap(h => h.lessons.map(l => l.id));

test('仓库规则检查全部通过', () => {
  const { ok, errors } = checkAllRules();
  assert.ok(ok, errors.join('\n'));
});

test('每个问题都有画板和三轮对话，反过来也没有多余的', () => {
  assert.deepEqual([...labIds].sort(), [...lessonIds].sort());
  assert.deepEqual(Object.keys(labTalks).sort(), [...lessonIds].sort());
});

test('三步走：每一步都有展馆', () => {
  assert.deepEqual([...new Set(halls.map(h => h.stage))], ['play', 'explore', 'challenge']);
});

test('首页轮播的入口都是真实的问题', () => {
  for (const star of homeShowcase) assert.ok(lessonIds.includes(star.play[0]), star.id);
});
