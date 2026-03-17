require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// DB 상태 확인
app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Routes
app.use('/api/track', require('./routes/track'));
app.use('/api/admin', require('./routes/admin'));

// 서버 시작 시 DB 마이그레이션 자동 실행
async function migrate() {
  const sql = `
    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      ip TEXT,
      user_agent TEXT,
      referer TEXT,
      country TEXT,
      city TEXT,
      country_code TEXT,
      visited_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country TEXT;
    ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country_code TEXT;
    CREATE TABLE IF NOT EXISTS link_clicks (
      id SERIAL PRIMARY KEY,
      link_id TEXT NOT NULL,
      link_title TEXT,
      ip TEXT,
      user_agent TEXT,
      clicked_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
    CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views(visited_at);
    CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);
  `;
  try {
    await pool.query(sql);
    console.log('✅ DB migration complete');
  } catch (err) {
    console.error('❌ DB migration failed:', err.message);
  }
}

migrate().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
