import express from 'express';
import Question from '../models/Question.js';
import UserProgress from '../models/UserProgress.js';

const router = express.Router();

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Helper to shuffle array
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Core similarity engine function
export const getRecommendationsForQuestion = async (userId, questionId, limit = 3) => {
  // 1. Fetch current question
  const src = await Question.findById(questionId);
  if (!src) return [];

  // 2. Fetch user's solved questions to exclude them
  const progressList = await UserProgress.find({ userId, status: 'Solved' });
  const solvedSet = new Set(progressList.map(p => p.questionId.toString()));
  solvedSet.add(questionId.toString()); // Exclude the current question itself

  // 3. Fetch all other questions
  const allQuestions = await Question.find({ _id: { $ne: questionId } });
  
  const ok = q => !solvedSet.has(q._id.toString());
  
  // Calculate next difficulty tier (stepping it up by one level)
  const currentDiffIndex = DIFFICULTIES.indexOf(src.difficulty);
  const nextDiff = DIFFICULTIES[Math.min(currentDiffIndex + 1, DIFFICULTIES.length - 1)];

  // Group candidate pools
  const poolSameTopicSameDiff = allQuestions.filter(q => ok(q) && q.topic === src.topic && q.difficulty === src.difficulty);
  const poolSameTopicNextDiff = allQuestions.filter(q => ok(q) && q.topic === src.topic && q.difficulty === nextDiff);
  const poolSameTopicAnyDiff = allQuestions.filter(q => ok(q) && q.topic === src.topic);
  const poolTagOverlap = allQuestions.filter(q => ok(q) && q.tags && src.tags && q.tags.some(t => src.tags.includes(t)));
  const poolAnyUnsolved = allQuestions.filter(q => ok(q));

  // Build the list in order of priority, removing duplicates
  const recommendations = [];
  const seenIds = new Set();

  const addFromPool = (pool) => {
    const shuffledPool = shuffle(pool);
    for (const q of shuffledPool) {
      if (!seenIds.has(q._id.toString())) {
        seenIds.add(q._id.toString());
        recommendations.push(q);
      }
      if (recommendations.length >= limit) return true;
    }
    return false;
  };

  // Run through pools in priority order
  if (addFromPool(poolSameTopicSameDiff)) return recommendations;
  if (addFromPool(poolSameTopicNextDiff)) return recommendations;
  if (addFromPool(poolSameTopicAnyDiff)) return recommendations;
  if (addFromPool(poolTagOverlap)) return recommendations;
  addFromPool(poolAnyUnsolved);

  return recommendations.slice(0, limit);
};

// GET /api/recommendations/:userId/:questionId - Specific problem recommendations
router.get('/:userId/:questionId', async (req, res) => {
  try {
    const { userId, questionId } = req.params;
    const recs = await getRecommendationsForQuestion(userId, questionId);
    res.json(recs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

// GET /api/recommendations/:userId - Daily picks based on overall progress
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user's progress log
    const progressLogs = await UserProgress.find({ userId });
    
    // Create maps of statuses
    const progressMap = {};
    progressLogs.forEach(p => {
      progressMap[p.questionId.toString()] = p.status;
    });

    const allQuestions = await Question.find();
    if (allQuestions.length === 0) {
      return res.json({ source: null, recommendations: [] });
    }

    // Try to find a question that is currently "In Progress"
    let srcQuestion = allQuestions.find(q => progressMap[q._id.toString()] === 'In Progress');
    
    // If none "In Progress", find a question that is "Todo" (or doesn't have progress logged yet)
    if (!srcQuestion) {
      srcQuestion = allQuestions.find(q => !progressMap[q._id.toString()] || progressMap[q._id.toString()] === 'Todo');
    }

    // Fallback to the first question if everything is completed or empty
    if (!srcQuestion) {
      srcQuestion = allQuestions[0];
    }

    const recs = await getRecommendationsForQuestion(userId, srcQuestion._id);
    res.json({
      source: srcQuestion,
      recommendations: recs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily recommendations', error: error.message });
  }
});

export default router;
