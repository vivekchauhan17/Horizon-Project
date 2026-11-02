# ExamPrep AI: Learn Smarter. Prepare Better.

An AI-powered exam preparation platform. Students build a personal **learning roadmap**, turn PDFs or text into **simplified notes**, take **AI quizzes**, create a **study plan**, and stay motivated with **goal tracking and a daily study streak**.

Built for the hackathon theme **Artificial Intelligence in Education**.

**Live demo:** https://horizon-project-qfjm.onrender.com
**GitHub:** https://github.com/bhupendrasinghbs/Exam-Preap-AI

---

## What makes it special

- **One complete study loop** in one app: roadmap, notes, quiz, planner and progress, instead of five separate tools.
- **AI roadmaps you can actually track.** Gemini builds a phase-by-phase roadmap. Save it as a goal with a sticker, tick topics, and watch the completion % grow.
- **A streak that rewards real progress.** The streak counts only when you complete a roadmap topic. Unticking removes it, so it cannot be faked, and it uses your local date.
- **Cheat-proof quizzes.** The answer key never reaches the browser. Scoring happens on the server after you submit.
- **Reliable AI output.** Every AI response is requested as JSON and validated on the backend. On a 503 or quota error it retries and switches to a backup model.
- **Safe by design.** The API key stays on the server, uploads are checked and never stored, and the API is rate limited.

---

## Features

| Page | What it does |
|---|---|
| **Landing** | Product intro, features and "How it works". |
| **Dashboard** | Compact streak card with calendar, plus quizzes attempted, average score, best score, notes saved, goal completion %, tasks completed, goals overview, recent activity, upcoming tasks and topics to revise. On phones the streak card appears first. |
| **Roadmap** | Enter a course, subject or tech field, your level, duration (4 / 8 / 12 / 24 weeks) and hours per week. Get phases with topics, a practice task and an outcome. Pick one of 7 goal stickers, save the roadmap as a goal, tick topics as you finish them, and reopen saved goals any time. |
| **Notes** | Upload a PDF (max 5 MB) or paste text. Get an overview, key concepts, definitions and a revision summary. Copy or save the notes. |
| **Quiz** | 5 or 10 MCQs (Easy / Medium / Hard) from pasted text or saved notes. One question at a time, server-side scoring, explanations, retake. |
| **Planner** | Subjects, exam date, daily hours, session length and weak topics give a day-by-day timetable with tickable tasks and a warning if time is too short. |
| **Progress** | Your saved roadmap goals only. Open a goal to see its completion % and tick topics. |

Every AI action shows a loading progress bar that disappears when the result or an error arrives.

### Study streak rules
- Counts only when a roadmap topic is completed (on the Roadmap or Progress page).
- Unticking a topic removes it; a day counts only while something from that day is still complete.
- The streak stays alive until the end of today if you studied yesterday.
- Quizzes, notes and the planner do not affect the streak.

---

## Tech stack

- **Frontend:** React + Vite (JavaScript/JSX), Tailwind CSS **v3**, React Router, Lucide icons
- **Backend:** Node.js, Express (ES modules), Multer, unpdf, dotenv, CORS, express-rate-limit
- **AI:** Google Gemini via `@google/genai`
- **Storage:** browser `localStorage` (no database or login)
- **Hosting:** Render (separate frontend and backend services)

---

## Project structure

```
Exam-Preap-AI/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js                     # CORS, rate limit, routes
│   │   ├── routes/api.routes.js
│   │   ├── controllers/api.controller.js
│   │   ├── services/ai.service.js     # all Gemini calls + validation
│   │   ├── services/pdf.service.js    # PDF text extraction
│   │   └── middleware/error.middleware.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # Landing, Dashboard, Roadmap, Notes, Quiz, Planner, Progress
│   │   ├── components/   # AppLayout, ui, GoalSticker, GoalView, StreakCalendar
│   │   ├── services/api.js
│   │   ├── utils/storage.js          # localStorage, goals and streak logic
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Run it locally

**Requirements:** Node.js LTS (v18+) and a free Gemini API key from https://aistudio.google.com/apikey

```bash
git clone https://github.com/bhupendrasinghbs/Exam-Preap-AI.git
cd Exam-Preap-AI
```

**Backend (port 5000)**
```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run dev
```
`backend/.env`:
```dotenv
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```
Model names change often. If you see a "model not found" error, check https://ai.google.dev/gemini-api/docs/models and update `GEMINI_MODEL`.

**Frontend (port 5173)**, in a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Do not set `VITE_API_URL` locally. It defaults to `http://localhost:5000`. Open http://localhost:5173.

> The frontend needs Tailwind **v3**: `npm install -D tailwindcss@3.4.17 postcss autoprefixer`. Commit `package-lock.json` so deployments use the same version.

---

## Deploy on Render

Local and deployed versions work at the same time.

**Backend (Web Service)**
- Root Directory: `backend` | Build: `npm install` | Start: `npm start`
- Environment: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`
- `app.js` already allows `http://localhost:5173` and the live frontend URL. Add more origins with `FRONTEND_ORIGIN` (comma-separated, no trailing slash).

**Frontend (Static Site)**
- Root Directory: `frontend` | Build: `npm install && npm run build` | Publish Directory: `dist`
- Environment: `VITE_API_URL=https://your-backend.onrender.com` (no `/api`, no trailing slash). Vite reads it at build time, so use *Clear build cache & deploy* after changing it.
- Redirects/Rewrites: `/*` to `/index.html` with action **Rewrite** (so refreshing `/dashboard` works).

---

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend status |
| POST | `/api/notes` | Notes from `{ text }` or a PDF `file` (multipart) |
| POST | `/api/quiz` | Generate MCQs (answer key stays on the server) |
| POST | `/api/quiz/submit` | Score a quiz on the server |
| POST | `/api/plan` | Generate a study timetable |
| POST | `/api/roadmap` | Generate a roadmap from `{ goal, level, weeks, hoursPerWeek, notes }` |

---

## How it works

```
Browser (React)  ->  Express backend  ->  Gemini AI
      ^                    |
  localStorage     validated JSON comes back
```

Saved in `localStorage`: `ep_notes`, `ep_quizzes`, `ep_plan`, `ep_goals`, `ep_roadmap_draft`, `ep_streak`.

---

## Security and safety

- API key only in backend environment variables, never in frontend code or Git.
- PDF type and size checked (5 MB max); files are read in memory and never saved.
- Text capped at 30,000 characters; the user is told when it is truncated.
- Rate limit of 30 requests per minute on `/api`; CORS limited to approved frontend origins.
- Errors never expose stack traces or secrets.
- AI content can be wrong. Students should verify important facts against course material.

---

## Demo flow (3 minutes)

1. **Dashboard:** show the streak card and empty state.
2. **Roadmap:** enter "Full Stack Web Development", pick a sticker, generate, save the goal, tick topics.
3. **Dashboard:** show the streak and goal completion going up.
4. **Notes:** upload a PDF, generate and save notes.
5. **Quiz:** pick the saved note, take 5 questions, submit, review explanations.
6. **Planner:** 3 topics, exam in 7 days, tick tasks.
7. **Progress:** open the saved goal and show its completion.

---

## Limitations and future work

- Data is stored in one browser only (no login), so clearing browser data resets goals and streaks.
- Scanned image PDFs are not supported (no OCR).
- Active quizzes expire if the backend restarts.
- No reminders are sent.

**Next:** login and MongoDB, OCR, flashcards and spaced repetition, reminders, multiple languages, teacher / class mode.