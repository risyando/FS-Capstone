require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./services/logger');
const { connectRedis } = require('./services/redis.service');

const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled Exception', err);
  res.status(500).json({ message: 'Terjadi kesalahan internal pada server.' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectRedis();
    app.listen(PORT, () => {
      logger.info(`Server berjalan di port ${PORT}`);
    });
  } catch (error) {
    logger.error('Gagal memulai server', error);
    process.exit(1);
  }
};

startServer();
