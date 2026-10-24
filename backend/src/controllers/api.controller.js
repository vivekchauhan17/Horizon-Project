
import { randomUUID } from 'node:crypto';
import { HttpError } from '../middleware/error.middleware.js';
import * as ai from '../services/ai.service.js';
import { extractPdfText } from '../services/pdf.service.js';

// In-memory answer keys (lost on server restart; fine for an MVP). Expire after 2 hours.
const keys = new Map();
setInterval(() => { for (const [id, q] of keys) if (Date.now() - q.created > 7_200_000) keys.delete(id); }, 600_000).unref();

const cleanText = (t) => { if (typeof t !== 'string' || t.trim().length < 50) throw new HttpError(400, 'Please provide at least 50 characters of study material.'); return t.trim(); };

export const health = (req, res) => res.json({ status: 'ok', message: 'StudyLoop AI backend is running', aiConfigured: !!process.env.GEMINI_API_KEY });

export async function notes(req, res) {
  let raw = req.body?.text;
  if (req.file) {
    if (req.file.mimetype !== 'application/pdf') throw new HttpError(400, 'Only PDF files are accepted.');
    raw = await extractPdfText(req.file.buffer);
  }
  const { text, truncated } = ai.prepareText(cleanText(raw));
  res.json({ notes: await ai.generateNotes(text), truncated, sourceText: text });
}

export async function quiz(req, res) {
  const { difficulty, count } = req.body || {};
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) throw new HttpError(400, 'Difficulty must be Easy, Medium or Hard.');
  if (![5, 10].includes(count)) throw new HttpError(400, 'Question count must be 5 or 10.');
  const { text, truncated } = ai.prepareText(cleanText(req.body.text));
  const q = await ai.generateQuiz(text, difficulty, count);
  const quizId = randomUUID();
  keys.set(quizId, { created: Date.now(), questions: q.questions });
  res.json({ quizId, topic: q.topic, truncated, questions: q.questions.map(({ question, options }) => ({ question, options })) });
}

export function submitQuiz(req, res) {
  const { quizId, answers } = req.body || {};
  const stored = keys.get(quizId);
  if (!stored) throw new HttpError(404, 'Quiz expired or not found. Please generate a new quiz.');
  if (!Array.isArray(answers) || answers.length !== stored.questions.length) throw new HttpError(400, 'Answers do not match the quiz.');
  if (stored.submitted) throw new HttpError(409, 'This quiz was already submitted.');
  stored.submitted = true;
  const results = stored.questions.map((q, i) => ({
    question: q.question, options: q.options, selected: Number.isInteger(answers[i]) ? answers[i] : null,
    correct: q.answerIndex, explanation: q.explanation, isCorrect: answers[i] === q.answerIndex,
  }));
  res.json({ score: results.filter((r) => r.isCorrect).length, total: results.length, results });
}

export async function roadmap(req, res) {
  const { goal, level, weeks, hoursPerWeek, notes } = req.body || {};
  if (typeof goal !== 'string' || goal.trim().length < 2 || goal.trim().length > 100) {
    throw new HttpError(400, 'Enter a course, subject or tech field (2-100 characters).');
  }
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) throw new HttpError(400, 'Choose a valid level.');
  if (![4, 8, 12, 24].includes(Number(weeks))) throw new HttpError(400, 'Duration must be 4, 8, 12 or 24 weeks.');
  const hours = Number(hoursPerWeek);
  if (!(hours >= 1 && hours <= 60)) throw new HttpError(400, 'Hours per week must be between 1 and 60.');
  const cleanNotes = typeof notes === 'string' ? notes.trim().slice(0, 500) : '';
  const data = await ai.generateRoadmap({ goal: goal.trim(), level, weeks: Number(weeks), hoursPerWeek: hours, notes: cleanNotes });
  res.json({ roadmap: data });
}

export async function plan(req, res) {
  const { subjects, examDate, hoursPerDay, sessionMinutes, weakTopics } = req.body || {};
  if (typeof subjects !== 'string' || !subjects.trim()) throw new HttpError(400, 'Enter at least one subject or topic.');
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate || '') || examDate <= today) throw new HttpError(400, 'Exam date must be a future date.');
  const hours = Number(hoursPerDay), mins = Number(sessionMinutes);
  if (!(hours > 0 && hours <= 16)) throw new HttpError(400, 'Daily study hours must be between 0.5 and 16.');
  if (!(mins >= 15 && mins <= 180)) throw new HttpError(400, 'Session duration must be 15–180 minutes.');
  const days = Math.round((new Date(examDate) - new Date(today)) / 86_400_000);
  const topicCount = subjects.split(/[,\n]/).filter((s) => s.trim()).length;
  const warning = hours * days < topicCount * 1.5
    ? `You have about ${(hours * days).toFixed(1)}h for ${topicCount} topics. This plan is tight; consider more hours or fewer topics.` : null;
  const tasks = await ai.generatePlan({ subjects: subjects.trim(), examDate, hoursPerDay: hours, sessionMinutes: mins, weakTopics, today, days });
  res.json({ tasks, warning });
}