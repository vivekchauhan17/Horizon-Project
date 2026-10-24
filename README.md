# ExamPrep AI: Learn Smarter. Prepare Better.
AI-powered exam prep: PDF/text → notes → MCQ quiz → study plan → progress tracking.

## Run it
```bash
# 1. Backend (port 5000)
cd backend && cp .env.example .env     # then put your key in .env
npm install && npm run dev

# 2. Frontend (port 5173), in a second terminal
cd frontend && cp .env.example .env
npm install && npm run dev
```
Open http://localhost:5173. Get a free Gemini key at https://aistudio.google.com/apikey and set `GEMINI_API_KEY` in `backend/.env`.
`GEMINI_MODEL` defaults to `gemini-2.5-flash`; if Google retires it, check the current name in the Gemini docs.

## Architecture
- **Frontend** (React/Vite/Tailwind): pages call `src/services/api.js`; data lives in `localStorage` (`ep_notes`, `ep_quizzes`, `ep_plan`).
- **Backend** (Express): `routes → controllers → services`. `ai.service.js` is the only file that talks to Gemini and validates every AI response before it is returned.
- **Quiz security**: `/api/quiz` returns questions *without* answers and keeps the key in server memory; `/api/quiz/submit` scores it. Limitation: keys are lost if the server restarts (expired quiz → generate a new one).
- **Safety**: 5 MB PDF limit (memory only, nothing saved to disk), text capped at 30,000 chars (user is told when truncated), rate limit 30 req/min, CORS limited to `FRONTEND_ORIGIN`, API key never reaches the browser.

## API
`GET /api/health` · `POST /api/notes` (JSON `{text}` or multipart `file`) · `POST /api/quiz` · `POST /api/quiz/submit` · `POST /api/plan`

## Troubleshooting
- *"Cannot reach the backend"*: backend not running, or `VITE_API_URL` is wrong.
- *CORS error*: `FRONTEND_ORIGIN` in `backend/.env` must match the frontend URL exactly.
- *"missing GEMINI_API_KEY"*: create `backend/.env` and restart the backend.
- *Port in use*: change `PORT` (and `VITE_API_URL`).
- *"No readable text"*: PDF is scanned images; use a text-based PDF.

## Demo flow (3 min)
Dashboard (empty) → Notes: upload a PDF → generate, save → Quiz: pick saved note, 5 Medium → answer, submit, show explanations → Planner: 3 topics, exam in 7 days → tick tasks → Progress.

## Pitch
**Problem:** students waste time turning long material into notes, finding practice questions and planning revision, using separate tools.
**Solution:** one workflow: upload → notes → quiz → plan → progress.
**Users:** school, college and competitive-exam students.
**AI:** backend sends task-specific prompts to Gemini asking for JSON, validates the structure, and only then sends it to the UI. Quiz answers stay server-side until submit.
**Stack:** React, Vite, Tailwind, Express, Multer, Gemini.
**Innovation:** the whole study loop in one app, and quiz mistakes feed a "topics to revise" list.
**Future:** login + database, OCR for scanned PDFs, spaced repetition, reminders, flashcards.
