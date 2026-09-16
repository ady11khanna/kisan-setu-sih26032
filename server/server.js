import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

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
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', apiRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Kisan Setu Express REST API Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
});
