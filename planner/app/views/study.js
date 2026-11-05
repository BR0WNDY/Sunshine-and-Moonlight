/* Subjects, lessons, and the House Cup — the Hogwarts Academy study view. */

import { esc, map, when } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { db } from '../lib/store.js';
import { fmtShort } from '../lib/date.js';
import {
  SUBJECT_STATUS_TONE, LESSON_STATUS_TONE, label,
} from '../lib/domain.js';
import {
  pageHead, addBtn, chip, cardTitle, rule, empty, progressBar, rowActions, options,
} from './shared.js';
import {
  sortedSubjects, subjectName, subjectProgress, subjectDaysLeft, homeworkOf,
  sortedLessons, lessonPoints, LESSON_DONE, TASK_POINTS, LESSON_POINTS,
  BONUS_MINUTES, BONUS_MAX, LESSON_CAP,
  knownTerms, currentTerm, termSummary,
} from '../model/study.js';

function houseCupPanel(term, t, lang) {
  const terms = knownTerms();
  const activeTerm = term || (currentTerm() && currentTerm().term) || terms[0] || '2/2026';
  const sum = termSummary(activeTerm);
  const termList = terms.includes(activeTerm) ? terms : [activeTerm, ...terms];

  return `
    <div class="card" style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">
        <span class="badge-tile amber">${icon('star', 18)}</span>
        <div>
          <div style="font-family:var(--display);font-size:20px;font-weight:700">${esc(t('houseCup'))}</div>
          <div class="page-sub">${esc(t(sum.rankKey))}</div>
        </div>
        <div class="spacer" style="margin-left:auto"></div>
        <select class="job-status" data-act="study-term" aria-label="${esc(t('termLabel'))}">
          ${options(termList.map((tm) => [tm, `${t('termLabel')} ${tm}`]), activeTerm)}
        </select>
        ${addBtn('term', t('addTerm'), 'ghost sm')}
      </div>

      <div class="goal-count" style="margin-bottom:8px">
        <span class="n">${sum.total} / ${sum.goal}</span>
        <span class="page-sub">${esc(t('pointsLabel'))}</span>
        <span class="chip ${sum.pct >= 100 ? 'green' : 'amber'}" style="margin-left:auto">${sum.pct}%</span>
      </div>
      ${progressBar(sum.pct, sum.pct >= 100 ? 'green' : 'amber')}

      <div class="mini-boxes">
        <div class="mini-box">
          <div class="l">${esc(t('fromTasksLabel'))}</div>
          <div class="v">${esc(t('ptsShort', sum.fromTasks))}</div>
        </div>
        <div class="mini-box">
          <div class="l">${esc(t('fromLessonsLabel'))}</div>
          <div class="v">${esc(t('ptsShort', sum.fromLessons))}</div>
        </div>
        <div class="mini-box">
          <div class="l">${esc(t('status'))}</div>
          <div class="v" style="font-size:16px">${esc(t(sum.rankKey))}</div>
        </div>
      </div>
    </div>`;
}

function subjectCard(sub, t, lang) {
  const prog = subjectProgress(sub.id);
  const openHw = homeworkOf(sub.id).filter((h) => !h.done).length;
  const daysLeft = subjectDaysLeft(sub);

  return `
    <div class="card goal-card">
      <div class="chips">
        ${when(sub.code, () => chip(sub.code, 'dark'))}
        ${chip(label(sub.status || 'กำลังเรียน', lang), SUBJECT_STATUS_TONE[sub.status] || 'green')}
        ${when(sub.term, () => chip(sub.term))}
        <span class="spacer" style="margin-left:auto"></span>
        ${rowActions('subject', 'subjects', sub.id)}
      </div>

      <div class="goal-name" style="padding-right:0">${esc(sub.name)}</div>
      <div class="page-sub">
        ${esc(label(sub.kind || 'วิชามหาวิทยาลัย', lang))}
        ${when(sub.lecturer, () => ` · ${esc(sub.lecturer)}`)}
        ${when(sub.credits, () => ` · ${sub.credits} ${esc(t('credits'))}`)}
      </div>

      <div class="goal-count" style="margin-top:4px">
        <span class="page-sub">${esc(t('lessonsProgress', prog.done, prog.total))}</span>
        <span class="chip ${prog.pct >= 100 ? 'green' : 'blue'}" style="margin-left:auto">${prog.pct}%</span>
      </div>
      ${progressBar(prog.pct, prog.pct >= 100 ? 'green' : '')}

      <div class="goal-foot">
        <span class="chip ${openHw > 0 ? 'amber' : 'green'}">${esc(t('openHwCount', openHw))}</span>
        ${when(daysLeft !== null, () => `<span class="chip" style="margin-left:auto">${icon('calendar', 13)}${esc(daysLeft >= 0 ? t('daysLeftShort', daysLeft) : t('settled'))}</span>`)}
      </div>
      ${when(sub.note, () => `<div class="goal-note">${esc(sub.note)}</div>`)}
    </div>`;
}

function potentialLessonPoints(row) {
  const base = LESSON_POINTS[row.kind] || 0;
  const minutes = Math.max(0, Number(row.minutes) || 0);
  const bonus = Math.min(BONUS_MAX, Math.floor(minutes / BONUS_MINUTES));
  return Math.min(LESSON_CAP, base + bonus);
}

function lessonRow(row, t, lang) {
  const done = row.status === LESSON_DONE;
  const subTitle = subjectName(row.subjectId, '');
  const pts = done ? lessonPoints(row) : potentialLessonPoints(row);

  return `
    <div class="plan-row ${done ? 'is-done' : ''}">
      <button class="check ${done ? 'on' : ''}" data-act="lesson-cycle" data-id="${esc(row.id)}"
        title="${esc(label(row.status, lang))}">${icon('check', 15)}</button>
      <div>
        <div class="${done ? 'done-text' : ''}" style="font-weight:600">
          ${when(subTitle, () => `<span class="hw-subject">${esc(subTitle)}</span>`)}${esc(row.title)}
        </div>
        <div class="page-sub">
          ${esc(label(row.kind || 'อ่าน', lang))}
          ${when(row.minutes, () => ` · ${row.minutes} min`)}
          ${when(row.date, () => ` · ${esc(fmtShort(row.date, lang))}`)}
          ${when(row.note, () => ` · ${esc(row.note)}`)}
        </div>
      </div>
      <span class="chip ${done ? 'green' : 'blue'}" style="margin-left:auto">+${pts}</span>
      <button class="chip ${LESSON_STATUS_TONE[row.status] || ''}" style="border:none"
        data-act="lesson-cycle" data-id="${esc(row.id)}">
        ${esc(label(row.status || 'ยังไม่เริ่ม', lang))}
      </button>
      ${rowActions('lesson', 'lessons', row.id)}
    </div>`;
}

export function studyView({ t, lang, state }) {
  const subjects = sortedSubjects();
  const lessons = sortedLessons();
  const seedAction = db.subjects.length === 0
    ? `<button class="btn ghost" data-act="seed-au-2-2026">${icon('graduation', 16)}${esc(t('seedAU'))}</button>`
    : '';

  return `
    ${pageHead('book', t('pgStudy'), t('studySub'),
      seedAction + addBtn('subject', t('addSubject')) + addBtn('lesson', t('addLesson'), 'amber'))}
    ${rule}

    ${houseCupPanel(state.studyTerm, t, lang)}

    ${cardTitle('graduation', t('subjectsHead'), 'blue',
      `<span class="chip" style="margin-left:auto">${esc(t('items', subjects.length))}</span>`)}
    ${subjects.length === 0
      ? `<div class="card">${empty('graduation', t('noSubjects'))}</div>`
      : `<div class="goal-grid">${map(subjects, (sub) => subjectCard(sub, t, lang))}</div>`}

    <div style="margin-top:26px">
      ${cardTitle('book', t('lessonsHead'), 'amber',
        `<span class="chip" style="margin-left:auto">${esc(t('items', lessons.length))}</span>`)}
    </div>
    <div class="card">
      ${lessons.length === 0 ? empty('book', t('noLessons')) : map(lessons, (row) => lessonRow(row, t, lang))}
    </div>`;
}
