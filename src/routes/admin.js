const router = require('express').Router();
const pool = require('../db');
const adminAuth = require('../middleware/auth');

router.use(adminAuth);

// 전체 요약 통계
router.get('/stats', async (req, res) => {
  try {
    const [views, clicks, topLinks, dailyViews, dailyClicks, topCountries, topCities] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM page_views'),
      pool.query('SELECT COUNT(*) AS total FROM link_clicks'),
      pool.query(`
        SELECT link_id, link_title, COUNT(*) AS count
        FROM link_clicks
        GROUP BY link_id, link_title
        ORDER BY count DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT DATE(visited_at) AS date, COUNT(*) AS count
        FROM page_views
        WHERE visited_at >= NOW() - INTERVAL '30 days'
        GROUP BY date ORDER BY date
      `),
      pool.query(`
        SELECT DATE(clicked_at) AS date, COUNT(*) AS count
        FROM link_clicks
        WHERE clicked_at >= NOW() - INTERVAL '30 days'
        GROUP BY date ORDER BY date
      `),
      pool.query(`
        SELECT country, country_code, COUNT(*) AS count
        FROM page_views
        WHERE country IS NOT NULL
        GROUP BY country, country_code
        ORDER BY count DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT city, country, COUNT(*) AS count
        FROM page_views
        WHERE city IS NOT NULL
        GROUP BY city, country
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    res.json({
      totalViews: parseInt(views.rows[0].total),
      totalClicks: parseInt(clicks.rows[0].total),
      topLinks: topLinks.rows,
      dailyViews: dailyViews.rows,
      dailyClicks: dailyClicks.rows,
      topCountries: topCountries.rows,
      topCities: topCities.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// 최근 방문자 목록
router.get('/visitors', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50'), 200);
  try {
    const result = await pool.query(
      'SELECT id, ip, user_agent, referer, country, city, country_code, visited_at FROM page_views ORDER BY visited_at DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// 최근 클릭 목록
router.get('/clicks', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50'), 200);
  try {
    const result = await pool.query(
      'SELECT id, link_id, link_title, ip, clicked_at FROM link_clicks ORDER BY clicked_at DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
