const router = require('express').Router();
const pool = require('../db');

// IP → 지역 조회 (ip-api.com 무료, 키 불필요)
async function getGeoInfo(ip) {
  try {
    // 로컬/프라이빗 IP는 조회 불가
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      return { country: 'Local', city: 'Local', country_code: 'LO' };
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,countryCode&lang=en`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (data.status === 'success') {
      return { country: data.country, city: data.city, country_code: data.countryCode };
    }
  } catch (_) {}
  return { country: null, city: null, country_code: null };
}

// 페이지 방문 기록
router.post('/pageview', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || req.body?.referer || '';
  try {
    const geo = await getGeoInfo(ip);
    await pool.query(
      'INSERT INTO page_views (ip, user_agent, referer, country, city, country_code) VALUES ($1, $2, $3, $4, $5, $6)',
      [ip, userAgent, referer, geo.country, geo.city, geo.country_code]
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
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
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
