import Budget from '../models/Budget.js';

/**
 * @desc Create or update a budget
 * @route POST /api/budgets
 * @access Private
 */
export const setBudget = async (req, res) => {
  try {
    const { category, limit, period } = req.body;
    const userId = req.user.id;

    if (!category || !limit) {
      return res.status(400).json({ status: 'error', message: 'Category and limit are required.' });
    }

    // Check if budget already exists for this category and user
    let budget = await Budget.findOne({ userId, category });

    if (budget) {
      budget.limit = limit;
      budget.period = period || budget.period;
      await budget.save();
    } else {
      budget = await Budget.create({
        userId,
        category,
        limit,
        period: period || 'monthly'
      });
    }

    res.json({
      status: 'success',
      data: budget
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc Get all budgets for a user
 * @route GET /api/budgets
 * @access Private
 */
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ userId });
    
    res.json({
      status: 'success',
      data: budgets
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc Delete a budget
 * @route DELETE /api/budgets/:id
 * @access Private
 */
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ status: 'error', message: 'Budget not found.' });
    }

    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ status: 'error', message: 'Not authorized.' });
    }

    await budget.deleteOne();
    res.json({ status: 'success', message: 'Budget removed.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
