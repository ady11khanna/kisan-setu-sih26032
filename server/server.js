import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { initDb } from './pgDatabase.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Kisan Setu Express REST API Server',
    version: '1.0.0',
    db: process.env.DATABASE_URL ? 'PostgreSQL (Render Cloud)' : 'SQLite (Local)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', apiRouter);

// Initialize DB and Start Server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Kisan Setu Express REST API Backend running on http://localhost:${PORT}`);
      console.log(`📡 Database: ${process.env.DATABASE_URL ? '🐘 PostgreSQL (Render Cloud)' : '🗄️  SQLite (Local Dev)'}`);
      console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    // Start server anyway if DB init fails
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT} (DB init failed: ${err.message})`);
    });
  });
