require('dotenv').config();
const pool = require('../src/db');

const sql = `
  CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    ip TEXT,
    user_agent TEXT,
    referer TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW()
  );

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

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
