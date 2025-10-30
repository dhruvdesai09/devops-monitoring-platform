const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: 5432,
  database: process.env.DB_NAME || 'monitoring',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123'
});

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:6379`
});

redisClient.connect().catch(console.error);

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS metrics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(100),
      value FLOAT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Database initialized');
}

initDB();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/api/metrics', async (req, res) => {
  try {
    const cached = await redisClient.get('latest_metrics');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 100'
    );
    
    await redisClient.setEx('latest_metrics', 10, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/metrics', async (req, res) => {
  try {
    const { metric_name, value } = req.body;
    const result = await pool.query(
      'INSERT INTO metrics (metric_name, value) VALUES ($1, $2) RETURNING *',
      [metric_name, value]
    );
    
    await redisClient.del('latest_metrics');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        metric_name,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value,
        COUNT(*) as count
      FROM metrics
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY metric_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
