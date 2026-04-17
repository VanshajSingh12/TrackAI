import express from 'express';
import { getChatAdvice, getChatHistory } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, getChatAdvice);
router.get('/', protect, getChatHistory);

export default router;
