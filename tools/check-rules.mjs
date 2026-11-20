#!/usr/bin/env node
/**
 * 代数游乐场 · 仓库规则与目录一致性检查器
 *
 * 用法：
 *   npm run check
 *   node tools/check-rules.mjs --quiet
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { halls } from '../src/catalog.js';
import { labTalks } from '../src/lab-talks.js';
import { hallChats, algebraWiki, algebraTalks } from '../src/algebra-story-data.js';
import { labIds } from '../src/lab-modes.js';
import { voiceManifest } from '../src/voice-manifest.js';
import { voiceLines } from '../src/voice-lines.js';
import { homeShowcase } from '../src/question-catalog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'src');
const FORBIDDEN_SCOLDING = /笨蛋|蠢货|废物|真笨|白痴/;

function walkFiles(dir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

const rel = filePath => path.relative(ROOT, filePath).replace(/\\/g, '/');

export function checkAllRules() {
  const errors = [];

  for (const doc of ['AGENTS.md', 'CLAUDE.md']) {
    if (!fs.existsSync(path.join(ROOT, doc))) errors.push(`[协作文档] 缺少根目录 ${doc}`);
  }
  for (const skillDoc of ['SKILL.md', 'kit-reference.md']) {
    const a = path.join(ROOT, '.agents', 'skills', 'algebra-playground-builder', skillDoc);
    const b = path.join(ROOT, 'skills', 'algebra-playground-builder', skillDoc);
    if (!fs.existsSync(a) || !fs.existsSync(b)) {
      errors.push(`[Skill缺失] 请同时保留 .agents/skills/algebra-playground-builder/${skillDoc} 与 skills/algebra-playground-builder/${skillDoc}`);
    } else if (fs.readFileSync(a, 'utf8') !== fs.readFileSync(b, 'utf8')) {
      errors.push(`[Skill不同步] .agents/skills/algebra-playground-builder/${skillDoc} 与 skills/algebra-playground-builder/${skillDoc} 内容不一致`);
    }
  }

  const importRe = /(?:from\s+|import\s*\(\s*)["'](\.[^"']+)["']/g;
  for (const file of walkFiles(SRC_DIR, f => f.endsWith('.js'))) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(importRe)) {
      const spec = match[1];
      if (!spec.endsWith('.js')) {
        errors.push(`[导入后缀] ${rel(file)} 中的相对导入 "${spec}" 必须显式写明 .js 后缀`);
        continue;
      }
      if (!fs.existsSync(path.resolve(path.dirname(file), spec))) {
        errors.push(`[导入缺失] ${rel(file)} 导入了不存在的文件 "${spec}"`);
      }
    }
  }
  // React 外壳（.ts/.tsx）互相导入不写后缀，导入原生 JS 模块时必须写 .js
  for (const file of walkFiles(SRC_DIR, f => /\.tsx?$/.test(f))) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(importRe)) {
      const spec = match[1];
      const target = path.resolve(path.dirname(file), spec);
      if (/\.(css|js)$/.test(spec) ? fs.existsSync(target) : ['.ts', '.tsx'].some(ext => fs.existsSync(target + ext))) continue;
      errors.push(fs.existsSync(`${target}.js`)
        ? `[导入后缀] ${rel(file)} 导入原生 JS 模块 "${spec}" 时必须写明 .js 后缀`
        : `[导入缺失] ${rel(file)} 导入了不存在的文件 "${spec}"`);
    }
  }

  for (const pureFile of ['algebra.js']) {
    const p = path.join(SRC_DIR, pureFile);
    if (fs.existsSync(p) && /\b(document|window|localStorage)\b/.test(fs.readFileSync(p, 'utf8'))) {
      errors.push(`[纯逻辑层] src/${pureFile} 不能访问 DOM 或 window/localStorage`);
    }
  }

  const hallIds = new Set(halls.map(h => h.id));
  const lessons = halls.flatMap(h => h.lessons.map(l => ({ ...l, hallId: h.id })));
  const lessonIds = new Set();

  for (const l of lessons) {
    if (!l.id) { errors.push(`[实验元数据] 展馆 ${l.hallId} 存在缺少 id 的实验`); continue; }
    if (lessonIds.has(l.id)) errors.push(`[重复ID] 实验 id "${l.id}" 重复`);
    lessonIds.add(l.id);
    for (const field of ['name', 'tag', 'intro', 'idea', 'question']) {
      if (!l[field]?.trim()) errors.push(`[实验元数据] 实验 "${l.id}" 缺少 ${field}`);
    }
    if (!Array.isArray(l.choices) || l.choices.length < 2 || l.answer < 0 || l.answer >= l.choices.length) {
      errors.push(`[小挑战] 实验 "${l.id}" 的 choices 或 answer 无效`);
    }
    if (FORBIDDEN_SCOLDING.test(`${l.intro}${l.idea}${l.question}`)) {
      errors.push(`[儿童语气] 实验 "${l.id}" 含有不适合儿童的贬损词`);
    }

    if (!Array.isArray(l.sources) || !l.sources.length || l.sources.some(([name, url]) => !name?.trim() || !/^https:\/\//.test(url ?? ''))) {
      errors.push(`[资料出处] 实验 "${l.id}" 至少需要 1 条 https 参考资料`);
    }
    if (!labIds.includes(l.id)) errors.push(`[游乐场] 实验 "${l.id}" 没有在 lab-modes.js 里登记画板`);

    const turns = labTalks[l.id];
    if (!turns || turns.length !== 3) {
      errors.push(`[三轮问答] 实验 "${l.id}" 必须在 labTalks 中配置 3 轮小念问爸爸`);
    } else {
      if (new Set(turns.map(t => JSON.stringify(t.scene))).size !== 3) {
        errors.push(`[动画场景] 实验 "${l.id}" 的 3 轮对话必须对应 3 个不同画板场景`);
      }
      turns.forEach((t, idx) => {
        if (!t.nian?.trim() || !t.dad?.trim()) errors.push(`[台词缺失] 实验 "${l.id}" 第 ${idx + 1} 轮缺少小念或爸爸台词`);
        if (FORBIDDEN_SCOLDING.test(`${t.nian}${t.dad}`)) errors.push(`[儿童语气] 实验 "${l.id}" 第 ${idx + 1} 轮含贬损词`);
      });
    }
  }

  if (new Set(homeShowcase.map(star => star.hall)).size !== halls.length) errors.push('[首页轮播] homeShowcase 需要覆盖全部展馆');
  if (new Set(homeShowcase.map(star => star.id)).size !== homeShowcase.length) errors.push('[首页轮播] homeShowcase 的 id 重复');
  for (const star of homeShowcase) {
    if (!hallIds.has(star.hall)) errors.push(`[首页轮播] "${star.id}" 的展馆 "${star.hall}" 不存在`);
    if (!lessonIds.has(star.play?.[0]) || !star.play[1]?.trim()) errors.push(`[首页轮播] "${star.id}" 的游乐场入口无效`);
    if (!/^https:\/\//.test(star.source?.[1] ?? '') || !star.source[0]?.trim()) errors.push(`[首页轮播] "${star.id}" 缺少资料出处`);
    if (!star.name?.trim() || !star.hook?.trim() || !star.en?.trim()) errors.push(`[首页轮播] "${star.id}" 缺少名字或一句介绍`);
  }

  for (const hall of halls) {
    if (!hallChats[hall.id] || hallChats[hall.id].length !== 2) {
      errors.push(`[展馆导览] "${hall.id}" 缺少 hallChats 二人开场`);
    }
    if (!algebraWiki.some(w => w.hall === hall.id)) {
      errors.push(`[代数故事] "${hall.id}" 至少需要 1 篇大师故事与家庭实验`);
    }
    if (!algebraTalks.some(t => t.hall === hall.id)) {
      errors.push(`[展馆问答] "${hall.id}" 至少需要 1 组小念问爸爸问答`);
    }
  }

  const wikiIds = new Set();
  for (const w of algebraWiki) {
    if (wikiIds.has(w.id)) errors.push(`[重复百科] "${w.id}" 重复`);
    wikiIds.add(w.id);
    if (!hallIds.has(w.hall)) errors.push(`[无效分类] 百科 "${w.id}" hall="${w.hall}" 无效`);
    if (!w.homeLab?.trim().startsWith('🏠')) errors.push(`[居家实验] 百科 "${w.id}" 的 homeLab 应以 "🏠" 开头`);
    if (!lessonIds.has(w.relatedLabId)) errors.push(`[断链百科] 百科 "${w.id}" 的 relatedLabId "${w.relatedLabId}" 不存在`);
  }

  const talkTitles = new Set();
  for (const t of algebraTalks) {
    if (talkTitles.has(t.title)) errors.push(`[重复问答] "${t.title}" 重复`);
    talkTitles.add(t.title);
    if (!hallIds.has(t.hall)) errors.push(`[无效分类] 问答 "${t.title}" hall="${t.hall}" 无效`);
    if (!t.turns || t.turns.length < 2 || !t.wrap?.trim()) errors.push(`[问答结构] "${t.title}" 至少需 2 轮对话及 wrap 总结`);
  }

  const clipLines = voiceLines().map(({ who, text }) => [who, text]);

  for (const [who, text] of clipLines) {
    const hash = voiceManifest[`${who}|${text.trim()}`];
    if (!hash) {
      errors.push(`[缺失语音清单] (${who}) ${text.slice(0, 24)}... 请运行 npm run voice`);
    } else {
      const mp3 = path.join(ROOT, 'public', 'voice', 'clips', `${hash}.mp3`);
      if (!fs.existsSync(mp3) || fs.statSync(mp3).size <= 1024) errors.push(`[缺失音频] ${rel(mp3)}`);
    }
  }

  for (const id of labIds) if (!lessonIds.has(id)) errors.push(`[游乐场] lab-modes.js 里的 "${id}" 在目录中不存在`);
  for (const id of Object.keys(labTalks)) if (!lessonIds.has(id)) errors.push(`[三轮问答] labTalks 里的 "${id}" 在目录中不存在`);

  const used = new Set(clipLines.map(([who, text]) => voiceManifest[`${who}|${text.trim()}`]).filter(Boolean));
  const clipsDir = path.join(ROOT, 'public', 'voice', 'clips');
  for (const file of fs.existsSync(clipsDir) ? fs.readdirSync(clipsDir) : []) {
    if (file.endsWith('.mp3') && !used.has(file.slice(0, -4))) errors.push(`[多余音频] public/voice/clips/${file} 已经没有台词在用，请运行 npm run voice`);
  }

  return {
    ok: errors.length === 0,
    errors,
    stats: {
      halls: halls.length,
      labs: lessons.length,
      wiki: algebraWiki.length,
      talks: algebraTalks.length,
      byHall: halls.map(h => ({
        id: h.id,
        name: h.name,
        labs: h.lessons.length,
        wiki: algebraWiki.filter(w => w.hall === h.id).length,
        talks: algebraTalks.filter(t => t.hall === h.id).length,
      })),
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const quiet = process.argv.includes('--quiet');
  const result = checkAllRules();
  if (!result.ok) {
    console.error(`\n❌ 发现 ${result.errors.length} 处规则问题：\n`);
    for (const err of result.errors) console.error(`  • ${err}`);
    process.exit(1);
  }
  if (!quiet) {
    const { stats } = result;
    console.log(`✅ 规则检查全部通过：${stats.halls} 座展馆 · ${stats.labs} 个实验 · ${stats.wiki} 篇代数故事 · ${stats.talks} 组问答\n`);
    for (const h of stats.byHall) {
      console.log(`  • ${h.name} (${h.id.padEnd(13)})  🎮 ${String(h.labs).padStart(2)} 个实验  📚 ${h.wiki} 故事  💬 ${h.talks} 问答`);
    }
  }
}
