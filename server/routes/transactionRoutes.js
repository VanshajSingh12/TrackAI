import express from 'express';
import { createTransaction, getAllTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/', protect, getAllTransactions);

export default router;
