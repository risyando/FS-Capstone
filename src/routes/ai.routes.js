const express = require('express');
const { analyzeSkills, getHistory } = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/analyze', authMiddleware, analyzeSkills);
router.get('/history', authMiddleware, getHistory);

module.exports = router;
