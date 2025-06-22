import { Router } from 'express';
import pool from '../db.js'; 
const r = Router();

/* GET /api/questions?category=Cartoon&limit=10 */
r.get('/questions', async (req, res) => {
  const { category, limit = 10 } = req.query;
  const { rows } = await pool.query(
    `SELECT q.* FROM questions q
     JOIN categories c ON c.id=q.category_id
     WHERE c.name=$1
     ORDER BY random()  LIMIT $2`, [category, limit]);
  res.json(rows);
});

/* POST /api/score   { category, score, total }  (optional) */
r.post('/score', (req, res) => {
  // store leaderboard later if desired
  res.sendStatus(204);
});

export default r;
