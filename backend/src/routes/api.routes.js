// import { Router } from 'express';
// import multer from 'multer';
// import * as c from '../controllers/api.controller.js';

// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } }); // memory storage: no temp files to clean up
// const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// const r = Router();
// r.get('/health', c.health);
// r.post('/notes', upload.single('file'), wrap(c.notes));
// r.post('/quiz', wrap(c.quiz));
// r.post('/quiz/submit', wrap(c.submitQuiz));
// r.post('/plan', wrap(c.plan));
// export default r;

import { Router } from 'express';
import multer from 'multer';
import * as c from '../controllers/api.controller.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } }); // memory storage: no temp files to clean up
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const r = Router();
r.get('/health', c.health);
r.post('/notes', upload.single('file'), wrap(c.notes));
r.post('/quiz', wrap(c.quiz));
r.post('/quiz/submit', wrap(c.submitQuiz));
r.post('/plan', wrap(c.plan));
r.post('/roadmap', wrap(c.roadmap));
export default r;