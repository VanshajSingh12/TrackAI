import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// --- UPDATED CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow internal requests (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    // 2. Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.includes(origin);

    // 3. Allow ANY Vercel preview deployment from your account
    // This solves the issue with the random characters in the URL
    const isVercelPreview = origin.endsWith('.vercel.app');

    if (isAllowed || isVercelPreview) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS. Origin was:", origin); // Helps you debug in Render logs
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ----------------------------------
// app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/budgets', budgetRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TrackAI API is running' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB Database'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});