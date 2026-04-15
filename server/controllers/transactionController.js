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
