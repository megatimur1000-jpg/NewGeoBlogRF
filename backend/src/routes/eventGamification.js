import express from 'express';
import pool from '../../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { calculateEventCompleteness, computeEventPoints } from '../utils/eventCompleteness.js';

const router = express.Router();

// GET /api/events/:id/completeness
router.get('/events/:id/completeness', async (req, res) => {
  try {
    const { id } = req.params;
    const evRes = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (evRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Событие не найдено' });
    }
    const ev = evRes.rows[0];
    const completeness = calculateEventCompleteness(ev);
    res.json({ success: true, data: { eventId: id, completeness } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка анализа события', error: err?.message });
  }
});

// POST /api/events/:id/award-points  — начислить очки за текущую полноту и привязки
router.post('/events/:id/award-points', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const evRes = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (evRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Событие не найдено' });
    }
    const ev = evRes.rows[0];
    const completeness = calculateEventCompleteness(ev);
    const points = computeEventPoints(ev, completeness);

    // Пишем в user_rating_points (без строгих связей, мб таблица уже есть)
    try {
      await pool.query(
        `INSERT INTO user_rating_points (user_id, target_type, target_id, points, meta, created_at)
         VALUES ($1, 'event', $2, $3, $4, NOW())`,
        [userId, id, points.totalPoints, JSON.stringify({ completeness, breakdown: points.breakdown })]
      );
    } catch (_) {
      // Если таблицы нет — пропускаем запись (MVP-сейф)
    }

    res.json({ success: true, data: { eventId: id, completeness, points } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ошибка начисления очков', error: err?.message });
  }
});

export default router;


