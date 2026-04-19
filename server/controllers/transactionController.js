import Transaction from '../models/Transaction.js';
import { parseTransaction } from '../utils/geminiParser.js';

/**
 * @desc Create a new transaction
 * @route POST /api/transactions
 * @access Private
 */
export const createTransaction = async (req, res) => {
  try {
    let { amount, description, category, type, text } = req.body;

    // If natural language text is provided, use Gemini to parse it
    if (text) {
      if (text.trim() === '') {
        return res.status(400).json({ status: 'error', message: 'Text input cannot be empty.' });
      }
      if (text.length > 500) {
        return res.status(400).json({ status: 'error', message: 'Text input is too long (max 500 characters).' });
      }
      try {
        const parsedData = await parseTransaction(text);
        amount = parsedData.amount;
        description = parsedData.description;
        category = parsedData.category;
        type = parsedData.type;
      } catch (aiError) {
        return res.status(422).json({
          status: 'error',
          message: 'AI failed to understand the text. Please provide structured data or try again.',
          error: aiError.message
        });
      }
    }

    // Validate required fields
    if (!amount || !category || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide amount, category, and type (or natural language text).'
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

/**
 * @desc Get all transactions for the logged-in user with financial summary
 * @route GET /api/transactions
 * @access Private
 */
export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all transactions for user, sorted by newest first
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.json({
      status: 'success',
      count: transactions.length,
      summary: {
        totalIncome,
        totalExpense,
        balance
      },
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch transactions.'
    });
  }
};

/**
 * @desc Update a transaction
 * @route PUT /api/transactions/:id
 * @access Private
 */
export const updateTransaction = async (req, res) => {
  try {
    const { amount, description, category, type, date } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found.' });
    }

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ status: 'error', message: 'Not authorized.' });
    }

    transaction.amount = amount || transaction.amount;
    transaction.description = description || transaction.description;
    transaction.category = category || transaction.category;
    transaction.type = type || transaction.type;
    transaction.date = date || transaction.date;

    const updatedTransaction = await transaction.save();

    res.json({
      status: 'success',
      data: updatedTransaction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc Delete a transaction
 * @route DELETE /api/transactions/:id
 * @access Private
 */
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found.' });
    }

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ status: 'error', message: 'Not authorized.' });
    }

    await transaction.deleteOne();
    res.json({ status: 'success', message: 'Transaction removed.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

