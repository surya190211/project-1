import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import questionRouter from './routes/questions.js';
import progressRouter from './routes/progress.js';
import recommendationsRouter from './routes/recommendations.js';
import userRouter from './routes/users.js';
import scheduleCron from './services/emailService.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/questions', questionRouter);
app.use('/api/progress', progressRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/users', userRouter);

// Root endpoint status check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'DSA Progress Tracker API is up and running.'
  });
});

// Start Cron Email Scheduler
scheduleCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in mode on port ${PORT}`);
});
