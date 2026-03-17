const router = require('express').Router();
const pool = require('../db');

// 페이지 방문 기록
router.post('/pageview', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || req.body.referer || '';
  try {
    await pool.query(
      'INSERT INTO page_views (ip, user_agent, referer) VALUES ($1, $2, $3)',
      [ip, userAgent, referer]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// 링크 클릭 기록
router.post('/click', async (req, res) => {
  const { linkId, linkTitle } = req.body;
  if (!linkId) return res.status(400).json({ error: 'linkId required' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const userAgent = req.headers['user-agent'] || '';
  try {
    await pool.query(
      'INSERT INTO link_clicks (link_id, link_title, ip, user_agent) VALUES ($1, $2, $3, $4)',
      [linkId, linkTitle || '', ip, userAgent]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
