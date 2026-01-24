import express from 'express';
import pool from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper: compute composite rating for a route
async function computeRouteRating(routeId) {
  // Votes score: sum of +1/-1 from route_ratings
  // Content weight: number of linked high-value content items (blogs, tips, qna)
  // Simple formula MVP: rating = votes_sum + 0.5 * content_count
  const votesRes = await pool.query(
    `SELECT COALESCE(SUM(vote), 0) AS votes_sum, COUNT(*) AS votes_count
     FROM route_ratings WHERE route_id = $1`,
    [routeId]
  );
  const votesSum = Number(votesRes.rows[0]?.votes_sum || 0);
  const votesCount = Number(votesRes.rows[0]?.votes_count || 0);

  const contentRes = await pool.query(
    `SELECT COUNT(*) AS cnt
     FROM route_content_links 
     WHERE route_id = $1`,
    [routeId]
  );
  const contentCount = Number(contentRes.rows[0]?.cnt || 0);

  const composite = votesSum + 0.5 * contentCount;

  return { rating: composite, votesSum, votesCount, contentCount };
}

// POST /api/routes/:id/vote { vote: 1 | -1 }
router.post('/routes/:id/vote', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const routeId = req.params.id;
    const { vote } = req.body;

    if (![1, -1].includes(Number(vote))) {
      return res.status(400).json({ success: false, message: 'vote должен быть 1 или -1' });
    }

    // Upsert голоса
    await pool.query(
      `INSERT INTO route_ratings (user_id, route_id, vote, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, route_id)
       DO UPDATE SET vote = EXCLUDED.vote, created_at = NOW()`,
      [userId, routeId, Number(vote)]
    );

    const agg = await computeRouteRating(routeId);

    res.json({ success: true, data: { routeId, ...agg } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка голосования за маршрут', error: err?.message });
  }
});

// GET /api/routes/:id/rating
router.get('/routes/:id/rating', async (req, res) => {
  try {
    const routeId = req.params.id;
    const agg = await computeRouteRating(routeId);
    res.json({ success: true, data: { routeId, ...agg } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка получения рейтинга маршрута', error: err?.message });
  }
});

// GET /api/routes/:id/alternatives - дочерние форки, отсортированные по рейтингу
router.get('/routes/:id/alternatives', async (req, res) => {
  try {
    const parentId = req.params.id;
    const { limit = 10, offset = 0 } = req.query;

    // Получаем дочерние маршруты
    const forksRes = await pool.query(
      `SELECT r.*
       FROM travel_routes r
       WHERE r.parent_route_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [parentId, Number(limit), Number(offset)]
    );

    // Считаем рейтинг для каждого
    const items = [];
    for (const row of forksRes.rows) {
      const agg = await computeRouteRating(row.id);
      items.push({ ...row, rating: agg.rating, votes_sum: agg.votesSum, votes_count: agg.votesCount, content_count: agg.contentCount });
    }

    // Сортируем по рейтингу по убыванию (MVP)
    items.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    res.json({ success: true, data: { alternatives: items, total: items.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка получения альтернатив маршрута', error: err?.message });
  }
});

export default router;


