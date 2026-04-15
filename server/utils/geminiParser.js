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
      You are a financial assistant. Analyze the following text and extract transaction details: "${text}".
      
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
