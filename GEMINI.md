# TrackAI - Project Context

## Overview
TrackAI is an AI-powered personal finance manager. It allows users to track expenses and income using natural language processing via the Gemini API.

## Core Features
1. Natural Language Expense Logging: "Lunch for 300" -> {amount: 300, category: 'Food', type: 'expense'}
2. AI Financial Advisor: Users can ask questions about their spending patterns.
3. Dashboard: Visualizing data using Recharts.

## Technical Stack
- **Frontend:** React.js, Tailwind CSS, Lucide React (icons), Recharts.
- **Backend:** Node.js, Express, MongoDB (Mongoose).
- **AI:** Google Generative AI SDK (@google/generative-ai).
- **Auth:** JWT and OTP-based verification.

## Coding Standards
- Use ES6 modules (import/export).
- Keep controllers and routes separate.
- Error handling: Always return structured JSON errors.
- Security: Never hardcode API keys; use process.env.