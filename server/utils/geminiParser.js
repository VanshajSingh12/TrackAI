import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc Parses a natural language string into a structured transaction object using Gemini AI.
 * @param {string} text - The input text (e.g., "Spent 500 on lunch")
 * @returns {Promise<Object>} - Structured JSON: { amount, description, category, type }
 */
export const parseTransaction = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    // const model = genAI.getGenerativeModel(
    //   { model: "gemini-1.5-flash" },
    //   { apiVersion: 'v1' }
    // )

    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Other'];

    const prompt = `
      You are a financial advisor. Analyze the following text and extract transaction details: "${text}".
      
      Return ONLY a raw JSON object with exactly these keys:
      - amount (Number)
      - description (String)
      - category (String: must be one of: ${categories.join(', ')})
      - type (String: either 'income' or 'expense')

      Rules:
      1. If the amount is missing, return 0.
      2. If the category is unclear, use 'Other'.
      3. If the type is not specified (e.g., "Salary"), assume 'expense' unless keywords like "salary", "earned", or "received" are present.
      4. DO NOT include any markdown formatting, backticks, or extra text. Just the raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text().trim();

    // Safety: Strip markdown blocks if the model ignores the "no markdown" instruction
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/```json|```/g, "").trim();
    }

    const parsedData = JSON.parse(responseText);

    // Final validation of the category against allowed list
    if (!categories.includes(parsedData.category)) {
      parsedData.category = 'Other';
    }

    return parsedData;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse transaction with AI.");
  }
};

/**
 * @desc Provides financial advice based on transaction history, budgets, and balance.
 * @param {string} query - The user's question
 * @param {Array} transactions - List of user transactions
 * @param {Array} history - Previous chat history
 * @param {Array} budgets - List of user budgets
 * @param {number} totalBalance - User's overall balance
 * @returns {Promise<string>} - Gemini's response
 */
export const getFinancialAdvice = async (query, transactions, history = [], budgets = [], totalBalance = 0) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const transactionContext = transactions.map(t =>
      `${t.date.toISOString().split('T')[0]}: ${t.type} of ${t.amount} for ${t.description || t.category} (${t.category})`
    ).join('\n');

    const budgetContext = budgets.map(b =>
      `${b.category}: ${b.limit} per ${b.period}`
    ).join('\n');

    const prompt = `
      You are a personal financial advisor for TrackAI. 
      
      User's Total Current Balance: ${totalBalance}

      User's Budget Limits:
      ${budgetContext || 'No budgets set yet.'}

      Recent Transaction History (Last 50):
      ${transactionContext}

      User Question: "${query}"

      Provide a helpful, concise, and professional response. 
      Consider the total balance when answering high-level questions about what they can afford.
      Use the budget information to tell the user if they are over or under their limits.
      Keep it under 150 words.
    `;

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    throw new Error("Failed to get financial advice from AI.");
  }
};
