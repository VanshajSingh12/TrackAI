import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc Parses a natural language string into a structured transaction object.
 */
export const parseTransaction = async (text) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT")), 20000)//20 sec ka time hai
  );

  try {
    const parsePromise = (async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Other'];

      const prompt = `
        You are a precise financial data extractor. Analyze: "${text}"
        Return ONLY a raw JSON object with:
        - amount (Number)
        - description (String)
        - category (String: must be one of: ${categories.join(', ')})
        - type (String: 'income' or 'expense')

        Rules:
        1. If non-financial, return amount 0.
        2. Category unclear = 'Other'.
        3. No markdown. No extra text.
        4. Gibberish = amount 0, description "Unrecognized input".
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```json|```/g, "").trim();
      }

      const parsedData = JSON.parse(responseText);
      if (!categories.includes(parsedData.category)) parsedData.category = 'Other';
      return parsedData;
    })();

    return await Promise.race([parsePromise, timeoutPromise]);
  } catch (error) {
    if (error.message === "TIMEOUT") {
      throw new Error("AI took too long to respond. Please try again.");
    }
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse transaction with AI.");
  }
};

/**
 * @desc Provides financial advice based on transaction history, budgets, and balance.
 */
export const getFinancialAdvice = async (query, transactions, history = [], budgets = [], totalBalance = 0) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT")), 20000)//20 sec ka time hai
  );

  try {
    const advicePromise = (async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const summary = transactions.reduce((acc, t) => {
        const key = `${t.type}_${t.category}`;
        acc[key] = (acc[key] || 0) + t.amount;
        return acc;
      }, {});

      const summaryContext = Object.entries(summary)
        .map(([key, amt]) => {
          const [type, cat] = key.split('_');
          return `- ${cat} (${type}): $${amt.toLocaleString()}`;
        })
        .join('\n');

      const recentTransactions = transactions.slice(0, 15).map(t =>
        `${t.date.toISOString().split('T')[0]}: ${t.type} of $${t.amount} for ${t.description || t.category}`
      ).join('\n');

      const budgetContext = budgets.map(b =>
        `${b.category}: $${b.limit.toLocaleString()} per ${b.period}`
      ).join('\n');

      const prompt = `
        You are a personal financial advisor for TrackAI. 
        Current Balance: $${totalBalance.toLocaleString()}
        Budgets: ${budgetContext || 'NO BUDGETS SET.'}
        --- FINANCIAL SUMMARY ---
        ${summaryContext || 'NO HISTORY.'}
        --- RECENT TRANSACTIONS ---
        ${recentTransactions || 'NONE.'}

        User Question: "${query}"

        Rules:
        1. Helpful, concise response (under 150 words).
        2. No hallucinations. If data is missing, ask the user to log more.
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
    })();

    return await Promise.race([advicePromise, timeoutPromise]);
  } catch (error) {
    if (error.message === "TIMEOUT") {
      return "I'm having trouble connecting to my brain right now. Please try again.";
    }
    console.error("Gemini Advice Error:", error);
    throw new Error("Failed to get financial advice from AI.");
  }
};
