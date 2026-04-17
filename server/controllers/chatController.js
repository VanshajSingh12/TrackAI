import ChatHistory from '../models/ChatHistory.js';
import Transaction from '../models/Transaction.js';
import { getFinancialAdvice } from '../utils/geminiParser.js';

/**
 * @desc Get AI financial advice
 * @route POST /api/chat
 * @access Private
 */
export const getChatAdvice = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Query is required.' });
    }

    // Fetch user's transactions for context
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(50);

    // Fetch last 5 chat messages for context
    const history = await ChatHistory.find({ userId }).sort({ createdAt: -1 }).limit(5);
    
    // Reverse to get chronological order for Gemini
    const chronologicalHistory = history.reverse();

    // Get advice from Gemini
    const advice = await getFinancialAdvice(query, transactions, chronologicalHistory);

    // Save user message and AI response to history
    await ChatHistory.create([
      { userId, role: 'user', content: query },
      { userId, role: 'assistant', content: advice }
    ]);

    res.json({
      status: 'success',
      data: advice
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get financial advice.'
    });
  }
};

/**
 * @desc Get chat history
 * @route GET /api/chat
 * @access Private
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ChatHistory.find({ userId }).sort({ createdAt: 1 });
    
    res.json({
      status: 'success',
      data: history
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch chat history.'
    });
  }
};
