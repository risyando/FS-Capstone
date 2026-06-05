const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../services/logger');
const { analyzeWithAI } = require('../services/ai.service');
const { redisClient } = require('../services/redis.service');

const analyzeSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills, experience, job_preferences } = req.body;

    if (!skills || !experience || !job_preferences) {
      return res.status(400).json({ message: 'Data tidak lengkap. Harap isi skills, experience, dan job_preferences.' });
    }

    const inputData = { skills, experience, job_preferences };
    const cacheKey = `analysis:${userId}:${JSON.stringify(inputData)}`;

    // 1. Cek di Redis Cache
    if (redisClient.isOpen) {
      try {
        const cachedResult = await redisClient.get(cacheKey);
        if (cachedResult) {
          logger.info(`Cache hit for user ${userId}`);
          return res.json({ source: 'cache', data: JSON.parse(cachedResult) });
        }
      } catch (redisError) {
        logger.error('Redis get error', redisError);
      }
    }

    // 2. Jika tidak ada di cache, teruskan ke FastAPI
    logger.info(`Calling AI API for user ${userId}`);
    const resultData = await analyzeWithAI(inputData);

    // 3. Simpan di PostgreSQL
    await prisma.analysisHistory.create({
      data: {
        userId,
        inputData,
        resultData
      }
    });

    // Update profil skill terakhir
    const existingProfile = await prisma.skillProfile.findFirst({ where: { userId } });
    if (existingProfile) {
      await prisma.skillProfile.update({
        where: { id: existingProfile.id },
        data: { skills, experienceLevel: experience }
      });
    } else {
      await prisma.skillProfile.create({
        data: { userId, skills, experienceLevel: experience }
      });
    }

    // 4. Simpan ke Redis Cache (TTL 24 jam = 86400 detik)
    if (redisClient.isOpen) {
      try {
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(resultData));
      } catch (redisError) {
        logger.error('Redis set error', redisError);
      }
    }

    res.json({ source: 'api', data: resultData });
  } catch (error) {
    logger.error('Error in analyzeSkills', error);
    res.status(500).json({ message: error.message || 'Terjadi kesalahan saat menganalisis data.' });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await prisma.analysisHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ history });
  } catch (error) {
    logger.error('Error in getHistory', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil riwayat.' });
  }
};

module.exports = { analyzeSkills, getHistory };
