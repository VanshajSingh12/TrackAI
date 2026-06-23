import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Get aggregated sustainability metrics and chart-ready datasets
 * @route   GET /api/analytics/sustainability
 * @access  Private
 */
export const getSustainabilityAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: User ID is required.'
            });
        }

        // Convert string userId to mongoose ObjectId safely for MongoDB aggregation
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // 1. Calculate General Aggregated Eco-Stats
        const generalStatsPromise = Transaction.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: null,
                    totalCO2: { $sum: '$sustainability.co2_footprint_kg' },
                    averageCO2: { $avg: '$sustainability.co2_footprint_kg' },
                    totalTransactions: { $sum: 1 },
                    sustainableCount: {
                        $sum: {
                            $cond: [
                                { $in: ['$sustainability.sdg_rating', ['A', 'B']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // 2. Aggregate Carbon Emissions grouped by Transaction Categories (for Pie/Doughnut Chart)
        const categoryBreakdownPromise = Transaction.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: '$category',
                    totalCO2: { $sum: '$sustainability.co2_footprint_kg' },
                    totalSpend: { $sum: '$amount' },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { totalCO2: -1 } }
        ]);

        // 3. Aggregate SDG Letter Grade Distributions (for Bar/Radial Charts)
        const ratingDistributionPromise = Transaction.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: '$sustainability.sdg_rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 4. Aggregate Weekly/Monthly CO2 Footprint Trends (for Line/Area Charts)
        // Groups by year-month-day for historical logging
        const co2TrendPromise = Transaction.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalCO2: { $sum: '$sustainability.co2_footprint_kg' },
                    totalSpend: { $sum: '$amount' }
                }
            },
            { $sort: { '_id': 1 } },
            { $limit: 30 } // Keep history capped at latest 30 tracked active days for UI balance
        ]);

        // 5. Gather the user's latest custom context eco-insights to feature on the dashboard
        const recentInsightsPromise = Transaction.find(
            { userId, 'sustainability.eco_insight': { $ne: "" } },
            { 'sustainability.eco_insight': 1, 'sustainability.sdg_alignment': 1, category: 1, amount: 1, date: 1 }
        )
            .sort({ date: -1 })
            .limit(5);

        // Resolve all aggregation queries concurrently for maximum speed
        const [generalStats, categoryBreakdown, ratingDistribution, co2Trend, recentInsights] = await Promise.all([
            generalStatsPromise,
            categoryBreakdownPromise,
            ratingDistributionPromise,
            co2TrendPromise,
            recentInsightsPromise
        ]);

        // Format clean default analytics response structure if user has zero transactions
        const summary = generalStats[0] || {
            totalCO2: 0,
            averageCO2: 0,
            totalTransactions: 0,
            sustainableCount: 0
        };

        res.status(200).json({
            status: 'success',
            data: {
                summary: {
                    totalCO2: parseFloat(summary.totalCO2.toFixed(2)),
                    averageCO2: parseFloat(summary.averageCO2.toFixed(2)),
                    totalTransactions: summary.totalTransactions,
                    sustainableRatio: summary.totalTransactions > 0
                        ? parseFloat(((summary.sustainableCount / summary.totalTransactions) * 100).toFixed(1))
                        : 0
                },
                categoryBreakdown: categoryBreakdown.map(item => ({
                    category: item._id,
                    totalCO2: parseFloat(item.totalCO2.toFixed(2)),
                    totalSpend: item.totalSpend,
                    transactionCount: item.transactionCount
                })),
                ratingDistribution: ratingDistribution.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, { A: 0, B: 0, C: 0, D: 0, F: 0 }),
                co2Trend: co2Trend.map(item => ({
                    date: item._id,
                    totalCO2: parseFloat(item.totalCO2.toFixed(2)),
                    totalSpend: item.totalSpend
                })),
                recentInsights: recentInsights.map(t => ({
                    id: t._id,
                    insight: t.sustainability.eco_insight,
                    sdg: t.sustainability.sdg_alignment,
                    category: t.category,
                    amount: t.amount,
                    date: t.date
                }))
            }
        });

    } catch (error) {
        console.error("Error generating sustainability analytics:", error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate sustainability metrics dashboard'
        });
    }
};