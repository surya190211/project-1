import express from 'express';
import Question from '../models/Question.js';

const router = express.Router();

// GET /api/questions - Fetch all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ num: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving questions', error: error.message });
  }
});

// POST /api/questions - Create a custom question
router.post('/', async (req, res) => {
  try {
    const { title, topic, difficulty, url, tags, num, platform } = req.body;

    if (!title || !topic || !difficulty) {
      return res.status(404).json({ message: 'Title, Topic and Difficulty are required' });
    }

    // Convert comma-separated tags or use array if provided
    let processedTags = [];
    if (typeof tags === 'string') {
      processedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) {
      processedTags = tags;
    }

    // Normalize slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const newQuestion = new Question({
      title,
      topic,
      difficulty,
      url: url || '#',
      tags: processedTags,
      num: num || null,
      slug,
      cc: title // Fallback CC matching
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Error adding question', error: error.message });
  }
});

export default router;
