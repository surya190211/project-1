import express from 'express';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';

const router = express.Router();

// Helper to update User Streak
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const todayStr = new Date().toDateString();
  if (user.streak.last === todayStr) return; // Already updated today

  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  if (user.streak.last === yesterdayStr) {
    user.streak.cur += 1;
  } else {
    user.streak.cur = 1;
  }

  user.streak.best = Math.max(user.streak.best, user.streak.cur);
  user.streak.last = todayStr;
  await user.save();
};

// GET /api/progress/:userId - Fetch all progress logs for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progressList = await UserProgress.find({ userId });
    res.json(progressList);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving progress', error: error.message });
  }
});

// POST /api/progress/:userId/:questionId - Update status or notes for a question
router.post('/:userId/:questionId', async (req, res) => {
  try {
    const { userId, questionId } = req.params;
    const { status, notes, lcSynced, ccSynced } = req.body;

    let progress = await UserProgress.findOne({ userId, questionId });

    const originalStatus = progress ? progress.status : 'Todo';

    if (!progress) {
      progress = new UserProgress({
        userId,
        questionId
      });
    }

    if (status !== undefined) {
      progress.status = status;
      if (status === 'Solved') {
        progress.dateCompleted = progress.dateCompleted || new Date();
      } else {
        progress.dateCompleted = null;
      }
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    if (lcSynced !== undefined) progress.lcSynced = lcSynced;
    if (ccSynced !== undefined) progress.ccSynced = ccSynced;

    const savedProgress = await progress.save();

    // Trigger streak update if status changed to Solved
    if (status === 'Solved' && originalStatus !== 'Solved') {
      await updateStreak(userId);
    }

    res.json(savedProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error: error.message });
  }
});

export default router;
