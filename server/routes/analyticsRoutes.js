import express from 'express';
import { getSustainabilityAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assumes you use 'protect' middleware to secure routes

const router = express.Router();

// Fetch aggregated sustainability metrics, insights, and chart details
router.get('/sustainability', protect, getSustainabilityAnalytics);

export default router;