import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import UserProgress from '../models/UserProgress.js';

const router = express.Router();

// GET /api/users - Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
});

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and Email are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({
      username,
      email,
      notif: true,
      streak: { cur: 0, best: 0, last: null }
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// PUT /api/users/:userId - Update user settings
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, notif } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (notif !== undefined) user.notif = notif;

    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user settings', error: error.message });
  }
});

// HELPER: Normalize strings for CodeChef matching
const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
};

// POST /api/users/:userId/sync/leetcode - Sync LeetCode profile and submissions
router.post('/:userId/sync/leetcode', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'LeetCode username is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // LeetCode GraphQL fetch
    const GQL_URL = 'https://leetcode.com/graphql';
    const GQL_QUERY = `
      query userPublicProfile($u: String!) {
        matchedUser(username: $u) {
          username
          profile {
            realName
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentAcSubmissionList(username: $u, limit: 50) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await fetch(GQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query: GQL_QUERY,
        variables: { u: username }
      })
    });

    if (!response.ok) {
      throw new Error(`LeetCode API HTTP error: ${response.status}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    const data = json.data;
    if (!data.matchedUser) {
      return res.status(404).json({ message: `LeetCode user "${username}" not found` });
    }

    // Save LeetCode username on user document
    user.leetcodeUsername = username;
    await user.save();

    // Get matching information
    const submissions = data.recentAcSubmissionList || [];
    const questions = await Question.find();

    let matchedCount = 0;
    for (const sub of submissions) {
      // Find matching question
      const targetSlug = sub.titleSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const question = questions.find(q => q.slug === targetSlug);

      if (question) {
        let progress = await UserProgress.findOne({ userId, questionId: question._id });
        if (!progress) {
          progress = new UserProgress({
            userId,
            questionId: question._id,
            status: 'Solved',
            lcSynced: true,
            dateCompleted: new Date(parseInt(sub.timestamp) * 1000)
          });
          await progress.save();
          matchedCount++;
        } else if (progress.status !== 'Solved') {
          progress.status = 'Solved';
          progress.lcSynced = true;
          progress.dateCompleted = progress.dateCompleted || new Date(parseInt(sub.timestamp) * 1000);
          await progress.save();
          matchedCount++;
        }
      }
    }

    // Return profile details + sync report
    const acStats = data.matchedUser.submitStatsGlobal.acSubmissionNum;
    res.json({
      success: true,
      profile: {
        username: data.matchedUser.username,
        name: data.matchedUser.profile.realName || data.matchedUser.username,
        rank: data.matchedUser.profile.ranking || 0,
        stats: {
          total: acStats.find(s => s.difficulty === 'All')?.count || 0,
          easy: acStats.find(s => s.difficulty === 'Easy')?.count || 0,
          med: acStats.find(s => s.difficulty === 'Medium')?.count || 0,
          hard: acStats.find(s => s.difficulty === 'Hard')?.count || 0
        }
      },
      submissions,
      matchedCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Error syncing LeetCode', error: error.message });
  }
});

// POST /api/users/:userId/sync/codechef - Sync CodeChef stats and problems via proxy API
router.post('/:userId/sync/codechef', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'CodeChef username is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attempt to pull from community API proxies
    const PROXIES = [
      u => `https://codechef-api.vercel.app/handle/${u}`,
      u => `https://competitive-coding-api.herokuapp.com/api/codechef?username=${u}`
    ];

    let data = null;
    let errorMsg = "";

    for (const getUrl of PROXIES) {
      try {
        const response = await fetch(getUrl(username), { signal: AbortSignal.timeout(8000) });
        if (response.ok) {
          const raw = await response.json();
          // Normalize responses
          if (raw.status === 'OK' || raw.username) {
            const stars = (r) => {
              if (r >= 2500) return '7★';
              if (r >= 2200) return '6★';
              if (r >= 2000) return '5★';
              if (r >= 1800) return '4★';
              if (r >= 1600) return '3★';
              if (r >= 1400) return '2★';
              return '1★';
            };
            const currentRating = raw.currentRating || raw.rating || 0;
            data = {
              username: raw.username || username,
              name: raw.name || raw.fullName || username,
              rating: currentRating,
              starsStr: raw.stars || stars(currentRating),
              total: raw.totalSolved || parseInt(raw.problemsSolved || 0) || 0,
              list: (raw.solvedProblems || raw.userSolvedProblems || []).map(p => typeof p === 'string' ? p : (p.title || p.name || p.code || ''))
            };
            break;
          } else if (raw.data) {
            data = {
              username: raw.data.username || username,
              name: raw.data.name || username,
              rating: raw.data.rating || 0,
              starsStr: '—',
              total: raw.data.problems_solved || 0,
              list: [] // herokuapp might not expose full array directly
            };
            break;
          }
        }
      } catch (err) {
        errorMsg = err.message;
      }
    }

    if (!data) {
      return res.status(502).json({
        message: 'Could not contact CodeChef API proxies. Use Manual Import instead.',
        error: errorMsg
      });
    }

    // Save CodeChef username on user document
    user.codechefUsername = username;
    await user.save();

    // Match problems
    const questions = await Question.find();
    let matchedCount = 0;

    for (const title of data.list) {
      const normInput = normalizeTitle(title);
      // Try to find a match in title or cc fields
      const question = questions.find(q => normalizeTitle(q.title) === normInput || (q.cc && normalizeTitle(q.cc) === normInput));

      if (question) {
        let progress = await UserProgress.findOne({ userId, questionId: question._id });
        if (!progress) {
          progress = new UserProgress({
            userId,
            questionId: question._id,
            status: 'Solved',
            ccSynced: true,
            dateCompleted: new Date()
          });
          await progress.save();
          matchedCount++;
        } else if (progress.status !== 'Solved') {
          progress.status = 'Solved';
          progress.ccSynced = true;
          progress.dateCompleted = progress.dateCompleted || new Date();
          await progress.save();
          matchedCount++;
        }
      }
    }

    res.json({
      success: true,
      profile: {
        username: data.username,
        name: data.name,
        rating: data.rating,
        starsStr: data.starsStr,
        total: data.total
      },
      list: data.list,
      matchedCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Error syncing CodeChef', error: error.message });
  }
});

// POST /api/users/:userId/sync/codechef/manual - Manual CodeChef Import
router.post('/:userId/sync/codechef/manual', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, problemsText } = req.body;

    if (!problemsText) {
      return res.status(400).json({ message: 'Problem list text is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const usernameToSave = username || user.codechefUsername || 'codechef_user';
    user.codechefUsername = usernameToSave;
    await user.save();

    const titles = problemsText.split('\n').map(s => s.trim()).filter(Boolean);
    const questions = await Question.find();
    let matchedCount = 0;

    for (const title of titles) {
      const normInput = normalizeTitle(title);
      const question = questions.find(q => normalizeTitle(q.title) === normInput || (q.cc && normalizeTitle(q.cc) === normInput));

      if (question) {
        let progress = await UserProgress.findOne({ userId, questionId: question._id });
        if (!progress) {
          progress = new UserProgress({
            userId,
            questionId: question._id,
            status: 'Solved',
            ccSynced: true,
            dateCompleted: new Date()
          });
          await progress.save();
          matchedCount++;
        } else if (progress.status !== 'Solved') {
          progress.status = 'Solved';
          progress.ccSynced = true;
          progress.dateCompleted = progress.dateCompleted || new Date();
          await progress.save();
          matchedCount++;
        }
      }
    }

    res.json({
      success: true,
      profile: {
        username: usernameToSave,
        name: usernameToSave,
        rating: 0,
        starsStr: '—',
        total: titles.length,
        manual: true
      },
      list: titles,
      matchedCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Error importing manual CodeChef list', error: error.message });
  }
});

// POST /api/users/:userId/disconnect/:platform - Disconnect LeetCode or CodeChef
router.post('/:userId/disconnect/:platform', async (req, res) => {
  try {
    const { userId, platform } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (platform === 'leetcode') {
      user.leetcodeUsername = "";
      // Mark matching progress files as not synced, but keep solved status (as per spec)
      await UserProgress.updateMany({ userId, lcSynced: true }, { lcSynced: false });
    } else if (platform === 'codechef') {
      user.codechefUsername = "";
      await UserProgress.updateMany({ userId, ccSynced: true }, { ccSynced: false });
    } else {
      return res.status(400).json({ message: 'Invalid platform specified' });
    }

    await user.save();
    res.json({ success: true, message: `Disconnected from ${platform}` });
  } catch (error) {
    res.status(500).json({ message: `Error disconnecting from ${platform}`, error: error.message });
  }
});

export default router;
