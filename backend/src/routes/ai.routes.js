import { Router } from 'express';
import * as ai from '../controllers/ai.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/categorize', protect, ai.aiCategorize);
router.post('/generate-description', protect, ai.aiGenerateDescription);
router.get('/recommendations/:productId', ai.aiGetRecommendations);
router.get('/personalized', protect, ai.aiPersonalized);
router.post('/chat', optionalAuth, ai.aiChat);
router.get('/semantic-search', optionalAuth, ai.aiSemanticSearch);

export default router;
