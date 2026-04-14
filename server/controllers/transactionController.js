import Transaction from '../models/Transaction.js';

/**
 * @desc Create a new transaction
 * @route POST /api/transactions
 * @access Private
 */
export const createTransaction = async (req, res) => {
  try {
    const { amount, description, category, type } = req.body;

    // Validate required fields (including 'type' which is required in our schema)
    if (!amount || !category || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide amount, category, and type (expense/income).'
      });
    }

    // userId comes from auth middleware (req.user.id)
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User ID is required.'
      });
    }

    const newTransaction = new Transaction({
      userId,
      amount,
      description,
      category,
      type
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      status: 'success',
      data: savedTransaction
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create transaction.'
    });
  }
};
